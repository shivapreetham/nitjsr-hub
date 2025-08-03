"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import HomeCard from "./HomeCard";
import Loader from "./Loader";
import MeetingModal from "./MeetingModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/app/hooks/use-toast";
import { useStreamVideoClient, Call } from "@stream-io/video-react-sdk";
import { useCurrentUserContext } from "@/core/lib/context/CurrentUserProvider";
import { Video, LogIn, Calendar, Plus } from "lucide-react";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <HomeCard
          icon={<Video className="text-blue-600" size={24} />}
          title="New Meeting"
          description="Start an instant meeting"
          handleClick={() => setMeetingState("isInstantMeeting")}
          className="bg-white hover:shadow-lg transition-all duration-200 border border-gray-200"
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <HomeCard
          icon={<LogIn className="text-green-600" size={24} />}
          title="Join Meeting"
          description="via invitation link"
          className="bg-white hover:shadow-lg transition-all duration-200 border border-gray-200"
          handleClick={() => setMeetingState("isJoiningMeeting")}
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <HomeCard
          icon={<Calendar className="text-purple-600" size={24} />}
          title="Schedule Meeting"
          description="Plan your meeting"
          className="bg-white hover:shadow-lg transition-all duration-200 border border-gray-200"
          handleClick={() => setMeetingState("isScheduleMeeting")}
        />
      </motion.div>

      {/* Schedule Meeting Modal */}
      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === "isScheduleMeeting"}
          onClose={() => setMeetingState(undefined)}
          title="Schedule Meeting"
          handleClick={createMeeting}
          className="bg-white rounded-lg shadow-xl border border-gray-200"
          buttonText="Schedule Meeting"
          buttonClassName="bg-blue-600 hover:bg-blue-700 text-white"
          buttonIcon={<Calendar size={16} className="mr-2" />}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Description
              </label>
              <Textarea
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                onChange={(e) => setValues({ ...values, description: e.target.value })}
                placeholder="What is this meeting about?"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date and Time
              </label>
              <input
                type="datetime-local"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                value={values.dateTime.toISOString().slice(0, 16)}
                onChange={(e) => setValues({ ...values, dateTime: new Date(e.target.value) })}
              />
            </div>
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
          icon={<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Plus className="text-green-600" size={24} />
          </div>}
          buttonIcon={<Calendar size={16} className="mr-2" />}
          className="text-center bg-white rounded-lg shadow-xl border border-gray-200"
          buttonText="Copy Meeting Link"
          buttonClassName="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <p className="text-gray-600 mb-4">
            Your meeting has been scheduled successfully. Share the link with participants to join.
          </p>
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200 text-sm text-gray-700 break-all">
            {meetingLink}
          </div>
        </MeetingModal>
      )}

      {/* Join Meeting Modal */}
      <MeetingModal
        isOpen={meetingState === "isJoiningMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Join Meeting"
        className="bg-white rounded-lg shadow-xl border border-gray-200"
        buttonText="Join Meeting"
        buttonClassName="bg-green-600 hover:bg-green-700 text-white"
        buttonIcon={<LogIn size={16} className="mr-2" />}
        handleClick={() => router.push(values.link)}
      >
        <div>
          <p className="text-gray-600 mb-4">
            Enter the meeting link you received to join the conversation.
          </p>
          <Input
            placeholder="https://meeting.link/..."
            onChange={(e) => setValues({ ...values, link: e.target.value })}
            className="w-full border-gray-300 focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </MeetingModal>

      {/* Instant Meeting Modal */}
      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start Instant Meeting"
        className="text-center bg-white rounded-lg shadow-xl border border-gray-200"
        buttonText="Start Meeting Now"
        buttonClassName="bg-blue-600 hover:bg-blue-700 text-white"
        buttonIcon={<Video size={16} className="mr-2" />}
        handleClick={createMeeting}
      >
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Video className="text-blue-600" size={32} />
          </div>
          <p className="text-gray-600">
            Create an instant meeting and invite others to join. Your meeting will start immediately.
          </p>
        </div>
      </MeetingModal>
    </div>
  );
};

export default MeetingTypeList;