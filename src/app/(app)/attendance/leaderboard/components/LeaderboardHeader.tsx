import { Trophy, Award } from 'lucide-react';

interface LeaderboardHeaderProps {
  stats: {
    total: number;
    averageAttendance: string;
    above75Percent: string;
    above75Count: number;
  } | null;
  isCurrentUserTopPerformer: boolean;
}

export default function LeaderboardHeader({ stats, isCurrentUserTopPerformer }: LeaderboardHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Trophy className="mr-2" /> Attendance Leaderboard
        </h1>
        
        <p className="opacity-80 mb-4">
          Track your attendance performance and see how you rank among your peers
        </p>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm uppercase tracking-wider opacity-80">Total Students</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm uppercase tracking-wider opacity-80">Average Attendance</p>
              <p className="text-2xl font-bold">{stats.averageAttendance}%</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-sm uppercase tracking-wider opacity-80">Students Above 75%</p>
              <p className="text-2xl font-bold">{stats.above75Count} ({stats.above75Percent}%)</p>
            </div>
            
            {isCurrentUserTopPerformer && (
              <div className="bg-amber-500/30 border border-amber-400/50 rounded-lg p-4 backdrop-blur-sm flex items-center">
                <Award className="mr-3" size={32} />
                <div>
                  <p className="uppercase tracking-wider font-bold">Congratulations!</p>
                  <p className="opacity-90">You are among the top performers!</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 