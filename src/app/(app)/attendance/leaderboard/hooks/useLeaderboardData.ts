import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { ApiResponse, UserData } from '../components/types';

export default function useLeaderboardData() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;

  const [leaderboardData, setLeaderboardData] = useState<ApiResponse | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [highlightedUser, setHighlightedUser] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'ascending' | 'descending'}>({
    key: 'rank',
    direction: 'ascending'
  });
  const [selectedUserDetails, setSelectedUserDetails] = useState<UserData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch leaderboard data
  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (selectedBatch) params.append('batch', selectedBatch);
      if (selectedBranch) params.append('branch', selectedBranch);
      if (selectedSubject) params.append('subject', selectedSubject);
      
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/attendance/leaderboard${queryString}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      
      const data: ApiResponse = await response.json();
      setLeaderboardData(data);
      
      // Find current user's ID to highlight
      if (userEmail && data.users.length > 0) {
        const currentUser = data.users.find(user => 
          user.email?.toLowerCase() === userEmail.toLowerCase()
        );
        
        if (currentUser) {
          setHighlightedUser(currentUser.id);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
      setError("Failed to load leaderboard data");
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedBatch, selectedBranch, selectedSubject]);

  // Apply subject filter and sorting
  useEffect(() => {
    if (!leaderboardData) return;
    
    let filtered = [...leaderboardData.users];
    
    // Apply subject filter if one is selected
    if (selectedSubject) {
      filtered = filtered
        .map(user => {
          const subjectData = user.subjects.find(
            s => s.subjectCode === selectedSubject
          );
          
          if (subjectData) {
            return {
              ...user,
              filteredPercentage: subjectData.attendancePercentage,
              filteredAttended: subjectData.attendedClasses,
              filteredTotal: subjectData.totalClasses
            };
          }
          return null;
        })
        .filter(Boolean) as UserData[];
    }
    
    // Apply search filter if a query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.batch?.toLowerCase().includes(query) ||
        user.branch?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof UserData];
      let bValue: any = b[sortConfig.key as keyof UserData];
      
      // Handle special case for subject-specific percentages
      if (sortConfig.key === 'percentage') {
        if (selectedSubject) {
          aValue = a.subjects.find(s => s.subjectCode === selectedSubject)?.attendancePercentage || 0;
          bValue = b.subjects.find(s => s.subjectCode === selectedSubject)?.attendancePercentage || 0;
        } else {
          aValue = a.overallPercentage;
          bValue = b.overallPercentage;
        }
      }
      
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    
    setFilteredUsers(filtered);
  }, [leaderboardData, selectedSubject, searchQuery, sortConfig]);

  // Sort handlers
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Memoized statistics
  const stats = useMemo(() => {
    if (!leaderboardData) return null;
    
    const total = filteredUsers.length;
    const averageAttendance = filteredUsers.reduce((sum, user) => 
      sum + (selectedSubject 
        ? (user.subjects.find(s => s.subjectCode === selectedSubject)?.attendancePercentage || 0)
        : user.overallPercentage), 0) / (total || 1);
    
    const above75Count = filteredUsers.filter(user => 
      (selectedSubject 
        ? (user.subjects.find(s => s.subjectCode === selectedSubject)?.attendancePercentage || 0) >= 75
        : user.overallPercentage >= 75)).length;
    
    return {
      total,
      averageAttendance: averageAttendance.toFixed(2),
      above75Percent: ((above75Count / total) * 100).toFixed(2),
      above75Count
    };
  }, [filteredUsers, selectedSubject]);

  // Determine if current user is in the top performers
  const isCurrentUserTopPerformer = useMemo(() => {
    if (!highlightedUser || !filteredUsers.length) return false;
    const userRank = filteredUsers.find(user => user.id === highlightedUser)?.rank || 0;
    return userRank <= 3;
  }, [highlightedUser, filteredUsers]);

  return {
    leaderboardData,
    filteredUsers,
    loading,
    error,
    selectedSubject,
    setSelectedSubject,
    selectedBatch,
    setSelectedBatch,
    selectedBranch,
    setSelectedBranch,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    highlightedUser,
    sortConfig,
    selectedUserDetails,
    setSelectedUserDetails,
    isExporting,
    setIsExporting,
    fetchLeaderboardData,
    requestSort,
    stats,
    isCurrentUserTopPerformer
  };
} 