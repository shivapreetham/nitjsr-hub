import { motion } from "framer-motion";
import { 
  Trophy, Medal, User, ArrowUp, ArrowDown, Info 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserData } from './types';
import { getMedalType } from '../utils/leaderboardHelpers';

interface LeaderboardTableProps {
  filteredUsers: UserData[];
  selectedSubject: string;
  highlightedUser: string | null;
  sortConfig: { key: string; direction: 'ascending' | 'descending' };
  requestSort: (key: string) => void;
  onUserDetailClick: (user: UserData) => void;
}

export default function LeaderboardTable({
  filteredUsers,
  selectedSubject,
  highlightedUser,
  sortConfig,
  requestSort,
  onUserDetailClick
}: LeaderboardTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted text-left">
                <th className="p-4 font-semibold text-muted-foreground cursor-pointer" onClick={() => requestSort('rank')}>
                  <div className="flex items-center">
                    <span>Rank</span>
                    {sortConfig.key === 'rank' && (
                      sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="p-4 font-semibold text-muted-foreground cursor-pointer" onClick={() => requestSort('username')}>
                  <div className="flex items-center">
                    <span>Student</span>
                    {sortConfig.key === 'username' && (
                      sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="p-4 font-semibold text-muted-foreground">Batch / Branch</th>
                <th className="p-4 font-semibold text-muted-foreground cursor-pointer" onClick={() => requestSort('percentage')}>
                  <div className="flex items-center">
                    <span>{selectedSubject ? `${selectedSubject}` : 'Overall'} %</span>
                    {sortConfig.key === 'percentage' && (
                      sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                    )}
                  </div>
                </th>
                <th className="p-4 font-semibold text-muted-foreground">Attended / Total</th>
                <th className="p-4 font-semibold text-muted-foreground text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isHighlighted = user.id === highlightedUser;
                const medal = getMedalType(user.rank);
                const subjectData = selectedSubject 
                  ? user.subjects.find(s => s.subjectCode === selectedSubject)
                  : null;
                
                const percentage = subjectData 
                  ? subjectData.attendancePercentage 
                  : user.overallPercentage;
                
                const attended = subjectData 
                  ? subjectData.attendedClasses 
                  : user.overallAttendedClasses;
                
                const total = subjectData 
                  ? subjectData.totalClasses 
                  : user.overallTotalClasses;
                
                const attendanceStatus = percentage >= 75 
                  ? "text-green-500" 
                  : percentage >= 65 
                    ? "text-amber-500" 
                    : "text-red-500";
                    
                return (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`border-t border-border ${isHighlighted ? "bg-primary/10" : ""} hover:bg-muted/50 transition-colors`}
                  >
                    <td className="p-4">
                      <div className="flex items-center">
                        {medal === 'gold' && (
                          <div className="mr-2 bg-amber-400 text-white p-1 rounded-full">
                            <Trophy size={16} />
                          </div>
                        )}
                        {medal === 'silver' && (
                          <div className="mr-2 bg-gray-300 text-white p-1 rounded-full">
                            <Medal size={16} />
                          </div>
                        )}
                        {medal === 'bronze' && (
                          <div className="mr-2 bg-amber-700 text-white p-1 rounded-full">
                            <Medal size={16} />
                          </div>
                        )}
                        <span className={medal ? "font-bold" : ""}>{user.rank}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3 overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} className="text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.username}</p>
                          {isHighlighted && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">You</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">
                        <div>{user.batch || '-'}</div>
                        <div>{user.branch || '-'}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`font-bold text-lg ${attendanceStatus}`}>
                        {percentage.toFixed(1)}%
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            percentage >= 75 
                              ? "bg-green-500" 
                              : percentage >= 65 
                                ? "bg-amber-500" 
                                : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <span className="font-medium text-foreground">{attended}</span>
                        <span className="text-muted-foreground"> / {total}</span>
                      </div>
                      
                      {subjectData && (
                        <div className="mt-1 text-xs">
                          {subjectData.isAbove75 ? (
                            <span className="text-green-500">
                              Can skip {subjectData.classesCanSkip} more
                            </span>
                          ) : (
                            <span className="text-red-500">
                              Need {subjectData.classesNeeded} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUserDetailClick(user)}
                        className="p-2 text-primary hover:text-primary/80 transition-colors rounded-full hover:bg-primary/10"
                      >
                        <Info size={18} />
                      </Button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 