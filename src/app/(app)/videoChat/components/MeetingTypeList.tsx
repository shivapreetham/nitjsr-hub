"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ReactDatePicker from "react-datepicker";
import { motion } from "framer-motion";
import HomeCard from "./HomeCard";
import Loader from "./Loader";
import MeetingModal from "./MeetingModal";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/app/hooks/use-toast";
import { useStreamVideoClient, Call } from "@stream-io/video-react-sdk";
import { useCurrentUserContext } from "@/context/CurrentUserProvider";

const initialValues = {
  dateTime: new Date(),
  description: "",
  link: "",
};

const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const client = useStreamVideoClient();
  const { toast } = useToast();

  // Get current user from context
  const { currentUser } = useCurrentUserContext();
  const loadingUser = !currentUser;

  const createMeeting = async () => {
    if (!client || !currentUser) return;
    try {
      if (!values.dateTime) {
        toast({ title: "Please select a date and time" });
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call("default", id);
      if (!call) throw new Error("Failed to create meeting");

      const startsAt = values.dateTime.toISOString();
      const description = values.description || "Instant Meeting";

      await call.getOrCreate({
        data: { starts_at: startsAt, custom: { description, userId: currentUser.id } },
      });

      setCallDetail(call);
      if (!values.description) {
        router.push(`videoChat/meeting/${call.id}`);
      }
      toast({ title: "Meeting Created" });
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to create Meeting" });
    }
  };

  if (!client || loadingUser) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

  // Card animation variants
  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className="relative overflow-hidden"
      variants={cardContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute top-10 left-10 h-32 w-32 rounded-full bg-blue-200 opacity-20 blur-xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 h-40 w-40 rounded-full bg-blue-300 opacity-20 blur-xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <motion.div variants={cardVariants}>
          <HomeCard
            icon={<i className="fa-solid fa-video text-blue-500 text-lg" />}
            title="New Meeting"
            description="Start an instant meeting"
            handleClick={() => setMeetingState("isInstantMeeting")}
            className="bg-blue-50/90 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
          />
        </motion.div>
        
        <motion.div variants={cardVariants}>
          <HomeCard
            icon={<i className="fa-solid fa-sign-in-alt text-blue-400 text-lg" />}
            title="Join Meeting"
            description="via invitation link"
            className="bg-blue-50/80 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100"
            handleClick={() => setMeetingState("isJoiningMeeting")}
          />
        </motion.div>
        
        <motion.div variants={cardVariants}>
          <HomeCard
            icon={<i className="fa-solid fa-calendar-plus text-indigo-500 text-lg" />}
            title="Schedule Meeting"
            description="Plan your meeting"
            className="bg-indigo-50/80 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100"
            handleClick={() => setMeetingState("isScheduleMeeting")}
          />
        </motion.div>

        {!callDetail ? (
          <MeetingModal
            isOpen={meetingState === "isScheduleMeeting"}
            onClose={() => setMeetingState(undefined)}
            title="Create Meeting"
            handleClick={createMeeting}
            className="rounded-xl bg-white/90 backdrop-filter backdrop-blur-md shadow-2xl border border-gray-100 max-w-md w-full"
            buttonText="Schedule Meeting"
            buttonClassName="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-all duration-300 py-3 font-medium"
            buttonIcon={<i className="fa-solid fa-calendar-check mr-2" />}
          >
            <div className="flex flex-col gap-3 mb-4">
              <label className="text-sm font-medium text-gray-700">Add a description</label>
              <Textarea
                className="border border-gray-200 rounded-lg bg-gray-50/50 focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:ring-offset-0 text-sm"
                onChange={(e) => setValues({ ...values, description: e.target.value })}
                placeholder="What is this meeting about?"
              />
            </div>
            <div className="flex w-full flex-col gap-3">
              <label className="text-sm font-medium text-gray-700">Select Date and Time</label>
              <ReactDatePicker
                selected={values.dateTime}
                onChange={(date: Date | null) => setValues({ ...values, dateTime: date! })}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                dateFormat="MMMM d, yyyy h:mm aa"
                className="w-full rounded-lg bg-gray-50/50 border border-gray-200 p-2 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
              />
            </div>
          </MeetingModal>
        ) : (
          <MeetingModal
            isOpen={meetingState === "isScheduleMeeting"}
            onClose={() => setMeetingState(undefined)}
            title="Meeting Created"
            handleClick={() => {
              navigator.clipboard.writeText(meetingLink);
              toast({ title: "Link Copied" });
            }}
            icon={<i className="fa-solid fa-check-circle text-green-500 text-4xl" />}
            buttonIcon={<i className="fa-solid fa-copy" />}
            className="text-center rounded-xl bg-white/90 backdrop-filter backdrop-blur-md shadow-2xl border border-gray-100 max-w-md w-full"
            buttonText="Copy Meeting Link"
            buttonClassName="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-all duration-300 py-3 font-medium"
          >
            <p className="my-4 text-gray-600">Your meeting has been scheduled successfully. Share the link with participants to join.</p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700 break-all mb-4">
              {meetingLink}
            </div>
          </MeetingModal>
        )}

        <MeetingModal
          isOpen={meetingState === "isJoiningMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Join a Meeting"
          className="text-center rounded-xl bg-white/90 backdrop-filter backdrop-blur-md shadow-2xl border border-gray-100 max-w-md w-full"
          buttonText="Join Meeting"
          buttonClassName="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg hover:opacity-90 transition-all duration-300 py-3 font-medium"
          buttonIcon={<i className="fa-solid fa-sign-in-alt mr-2" />}
          handleClick={() => router.push(values.link)}
        >
          <p className="mb-4 text-gray-600 text-sm">Enter the meeting link you received to join the conversation.</p>
          <Input
            placeholder="https://meeting.link/..."
            onChange={(e) => setValues({ ...values, link: e.target.value })}
            className="border border-gray-200 rounded-lg bg-gray-50/50 focus-visible:ring-1 focus-visible:ring-blue-400 focus-visible:ring-offset-0 text-sm py-2.5"
          />
        </MeetingModal>

        <MeetingModal
          isOpen={meetingState === "isInstantMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Start an Instant Meeting"
          className="text-center rounded-xl bg-white/90 backdrop-filter backdrop-blur-md shadow-2xl border border-gray-100 max-w-md w-full"
          buttonText="Start Meeting Now"
          buttonClassName="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-all duration-300 py-3 font-medium"
          buttonIcon={<i className="fa-solid fa-play mr-2" />}
          handleClick={createMeeting}
        >
          <div className="flex flex-col items-center justify-center gap-4 my-6">
            <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center">
              <i className="fa-solid fa-video text-blue-500 text-3xl"></i>
            </div>
            <p className="text-gray-600 text-sm">Create an instant meeting and invite others to join. Your meeting will start immediately.</p>
          </div>
        </MeetingModal>
      </section>
    </motion.div>
  );
};

export default MeetingTypeList;