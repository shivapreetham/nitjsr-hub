import { UserStats } from './types';
import { Flame, Calendar, Award } from 'lucide-react';

export default function UserStatsBanner({ userStats }: { userStats: UserStats }) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-8 overflow-hidden">
      <div className="p-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-bold text-white mb-1">Your Attendance Streak</h3>
          <p className="text-blue-100">Keep up the good work to maintain your academic performance!</p>
        </div>
        <div className="flex space-x-6">
          <div className="text-center">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/20 mx-auto mb-2">
              <Flame className="h-7 w-7 text-orange-300" />
            </div>
            <p className="text-xl font-bold text-white">{userStats.loginStreak}</p>
            <p className="text-sm text-blue-100">Current Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/20 mx-auto mb-2">
              <Calendar className="h-7 w-7 text-blue-100" />
            </div>
            <p className="text-xl font-bold text-white">{userStats.loginDays}</p>
            <p className="text-sm text-blue-100">Total Days</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-white/20 mx-auto mb-2">
              <Award className="h-7 w-7 text-yellow-300" />
            </div>
            <p className="text-xl font-bold text-white">{userStats.honorScore}</p>
            <p className="text-sm text-blue-100">Honor Score</p>
          </div>
        </div>
      </div>
    </div>
  );
} 