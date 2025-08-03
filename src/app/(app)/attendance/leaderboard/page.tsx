"use client";

import { 
  Search, Filter, RefreshCw, Download, Share2, X, Trophy, Award, Calendar, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useLeaderboardData from './hooks/useLeaderboardData';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header with title and stats */}
      <LeaderboardHeader 
        stats={stats}
        isCurrentUserTopPerformer={isCurrentUserTopPerformer}
      />
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Filters and controls */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div className="flex items-center mb-4 md:mb-0 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input 
                  type="text"
                  placeholder="Search by name, batch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
              
              <button 
                className="ml-2 p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} className={showFilters ? "text-blue-600" : "text-gray-600"} />
              </button>
              
              <button 
                className="ml-2 p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                onClick={fetchLeaderboardData}
                disabled={loading}
              >
                <RefreshCw size={20} className={`text-gray-600 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
            
            <div className="flex space-x-2 w-full md:w-auto justify-end">
              <button
                onClick={handleExportToCSV}
                disabled={isExporting || filteredUsers.length === 0}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg ${
                  filteredUsers.length === 0 
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                    : "bg-green-600 hover:bg-green-700 text-white"
                } transition-colors`}
              >
                <Download size={16} />
                <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
              </button>
              
              <button
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                onClick={handleShare}
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
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
                <div className="pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Overall Performance</option>
                      {leaderboardData?.metadata.subjects.map((subject) => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Batches</option>
                      {leaderboardData?.metadata.batches.map((batch) => (
                        <option key={batch} value={batch}>{batch}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Branches</option>
                      {leaderboardData?.metadata.branches.map((branch) => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 text-right">
                  <button
                    onClick={() => {
                      setSelectedSubject("");
                      setSelectedBatch("");
                      setSelectedBranch("");
                      setSearchQuery("");
                      setSortConfig({ key: 'rank', direction: 'ascending' });
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Reset Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-50 rounded-full">
                <Search size={32} className="text-blue-500" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? `No students match your search for "${searchQuery}"`
                : "No students match your current filters"}
            </p>
            <button
              onClick={() => {
                setSelectedSubject("");
                setSelectedBatch("");
                setSelectedBranch("");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
        
        {/* User detail modal */}
        {selectedUserDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            >
              {/* Modal header */}
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {selectedUserDetails.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedUserDetails.username}</h2>
                      <p className="text-sm text-gray-600">
                        Rank #{selectedUserDetails.rank} • {selectedUserDetails.batch || 'N/A'} • {selectedUserDetails.branch || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedUserDetails(null)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* Modal content */}
              <div className="p-6">
                {/* Overall Performance */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                    Overall Performance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Award className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Overall Percentage</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedUserDetails.overallPercentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Classes Attended</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedUserDetails.overallAttendedClasses}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">Total Classes</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {selectedUserDetails.overallTotalClasses}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subject-wise Performance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h3>
                  <div className="space-y-3">
                    {selectedUserDetails.subjects.map((subject: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{subject.subjectName}</h4>
                            <p className="text-sm text-gray-600">Prof. {subject.facultyName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {subject.attendancePercentage.toFixed(1)}%
                            </p>
                            <p className="text-sm text-gray-600">
                              {subject.attendedClasses}/{subject.totalClasses} classes
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
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
              <div className="p-4 border-t bg-gray-50 flex justify-end">
                <button
                  onClick={() => setSelectedUserDetails(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}