"use client";

import { 
  Search, Filter, RefreshCw, Download, Share2, X, Trophy, Award, Calendar, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import useLeaderboardData from './(comp)/hooks/useLeaderboardData';
import { exportToCSV, shareLeaderboard } from './(comp)/utils/leaderboardHelpers';
import LeaderboardHeader from './(comp)/components/LeaderboardHeader';
import LeaderboardTable from './(comp)/components/LeaderboardTable';

export default function LeaderboardPage() { 
  const {
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
    setSortConfig,
    selectedUserDetails,
    setSelectedUserDetails,
    isExporting,
    setIsExporting,
    fetchLeaderboardData,
    requestSort,
    stats,
    isCurrentUserTopPerformer
  } = useLeaderboardData();

  const handleExportToCSV = () => {
    exportToCSV(filteredUsers, selectedSubject, setIsExporting);
  };

  const handleShare = () => {
    shareLeaderboard();
  };

  const handleUserDetailModal = (user: any) => {
    setSelectedUserDetails(user);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with title and stats */}
      <LeaderboardHeader 
        stats={stats}
        isCurrentUserTopPerformer={isCurrentUserTopPerformer}
      />
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Filters and controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4">
              <div className="flex items-center mb-4 md:mb-0 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Input 
                    type="text"
                    placeholder="Search by name, batch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                </div>
                
                <Button 
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={20} className={showFilters ? "text-primary" : "text-muted-foreground"} />
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={fetchLeaderboardData}
                  disabled={loading}
                >
                  <RefreshCw size={20} className={`text-muted-foreground ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
              
              <div className="flex space-x-2 w-full md:w-auto justify-end">
                <Button
                  onClick={handleExportToCSV}
                  disabled={isExporting || filteredUsers.length === 0}
                  variant={filteredUsers.length === 0 ? "secondary" : "default"}
                  className={filteredUsers.length === 0 ? "opacity-50" : ""}
                >
                  <Download size={16} className="mr-1" />
                  {isExporting ? "Exporting..." : "Export CSV"}
                </Button>
                
                <Button
                  onClick={handleShare}
                >
                  <Share2 size={16} className="mr-1" />
                  Share
                </Button>
              </div>
            </div>
            
            {/* Expanded filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Subject</label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                      >
                        <option value="">Overall Performance</option>
                        {leaderboardData?.metadata.subjects.map((subject) => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Batch</label>
                      <select
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                      >
                        <option value="">All Batches</option>
                        {leaderboardData?.metadata.batches.map((batch) => (
                          <option key={batch} value={batch}>{batch}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Branch</label>
                      <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                      >
                        <option value="">All Branches</option>
                        {leaderboardData?.metadata.branches.map((branch) => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSubject("");
                        setSelectedBatch("");
                        setSelectedBranch("");
                        setSearchQuery("");
                        setSortConfig({ key: 'rank', direction: 'ascending' });
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
        
        {/* Error message */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-destructive" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
        
        {/* Leaderboard table */}
        {!loading && filteredUsers.length > 0 && (
          <LeaderboardTable
            filteredUsers={filteredUsers}
            selectedSubject={selectedSubject}
            highlightedUser={highlightedUser}
            sortConfig={sortConfig}
            requestSort={requestSort}
            onUserDetailClick={handleUserDetailModal}
          />
        )}
        
        {/* Empty state */}
        {!loading && filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Search size={32} className="text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No students match your search for "${searchQuery}"`
                  : "No students match your current filters"}
              </p>
              <Button
                onClick={() => {
                  setSelectedSubject("");
                  setSelectedBatch("");
                  setSelectedBranch("");
                  setSearchQuery("");
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* User detail modal */}
        {selectedUserDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto border"
            >
              {/* Modal header */}
              <div className="p-6 border-b border-border">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-lg">
                        {selectedUserDetails.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{selectedUserDetails.username}</h2>
                      <p className="text-sm text-muted-foreground">
                        Rank #{selectedUserDetails.rank} • {selectedUserDetails.batch || 'N/A'} • {selectedUserDetails.branch || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUserDetails(null)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {/* Modal content */}
              <div className="p-6">
                {/* Overall Performance */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                    Overall Performance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-primary/10 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Award className="h-5 w-5 text-primary mr-2" />
                        <span className="text-sm font-medium text-foreground">Overall Percentage</span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {selectedUserDetails.overallPercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium text-foreground">Classes Attended</span>
                      </div>
                      <p className="text-2xl font-bold text-green-500">
                        {selectedUserDetails.overallAttendedClasses}
                      </p>
                    </div>
                    <div className="bg-purple-500/10 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <BookOpen className="h-5 w-5 text-purple-500 mr-2" />
                        <span className="text-sm font-medium text-foreground">Total Classes</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-500">
                        {selectedUserDetails.overallTotalClasses}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subject-wise Performance */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Subject-wise Performance</h3>
                  <div className="space-y-3">
                    {selectedUserDetails.subjects.map((subject: any, index: number) => (
                      <div key={index} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-foreground">{subject.subjectName}</h4>
                            <p className="text-sm text-muted-foreground">Prof. {subject.facultyName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">
                              {subject.attendancePercentage.toFixed(1)}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {subject.attendedClasses}/{subject.totalClasses} classes
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              subject.attendancePercentage >= 90 ? 'bg-green-500' : 
                              subject.attendancePercentage >= 75 ? 'bg-blue-500' : 
                              subject.attendancePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, subject.attendancePercentage)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Modal footer */}
              <div className="p-4 border-t border-border bg-muted/50 flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setSelectedUserDetails(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}