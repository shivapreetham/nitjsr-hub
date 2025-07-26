import { toast } from "react-hot-toast";
import { UserData } from '../components/types';

// Get medal type based on rank
export const getMedalType = (rank: number) => {
  if (rank === 1) return 'gold';
  if (rank === 2) return 'silver';
  if (rank === 3) return 'bronze';
  return null;
};

// Export to CSV
export const exportToCSV = (
  filteredUsers: UserData[],
  selectedSubject: string,
  setIsExporting: (exporting: boolean) => void
) => {
  if (!filteredUsers.length) return;
  
  setIsExporting(true);
  
  try {
    const heading = selectedSubject 
      ? `Rank,Username,Batch,Branch,${selectedSubject} Attendance %,Attended,Total Classes\n`
      : 'Rank,Username,Batch,Branch,Overall Attendance %,Attended,Total Classes\n';
    
    const csvContent = filteredUsers.map(user => {
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
      
      return `${user.rank},"${user.username}","${user.batch || ''}","${user.branch || ''}",${percentage},${attended},${total}`;
    }).join('\n');
    
    const csv = heading + csvContent;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance-leaderboard${selectedSubject ? `-${selectedSubject}` : ''}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Leaderboard exported successfully!');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    toast.error('Failed to export leaderboard');
  } finally {
    setIsExporting(false);
  }
};

// Share functionality
export const shareLeaderboard = () => {
  if (navigator.share) {
    navigator.share({
      title: 'Attendance Leaderboard',
      text: 'Check out our class attendance leaderboard!',
      url: window.location.href,
    })
    .then(() => toast.success('Shared successfully!'))
    .catch((error) => console.log('Error sharing', error));
  } else {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  }
}; 