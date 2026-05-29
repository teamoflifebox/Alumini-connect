import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Briefcase, GraduationCap, Filter } from 'lucide-react';
import { searchProfiles } from '../api';
import type { Profile } from '../types';

export const AlumniDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ role: '', skills: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['profiles', searchTerm, filters],
    queryFn: () => searchProfiles({ name: searchTerm, ...filters })
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alumni Directory</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Discover and connect with alumni from around the world.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-4 border border-gray-100 dark:border-gray-700">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, company, or role..."
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-300"
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">All Roles</option>
            <option value="alumni">Alumni</option>
            <option value="student">Student</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
            <Filter className="h-5 w-5" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.data?.map((profile: Profile) => (
            <div key={profile.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-sm" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-sm">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                        {profile.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {profile.name}
                </h3>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 h-10">
                  {profile.headline || 'Member'}
                </p>

                <div className="w-full space-y-2 mb-6">
                  {profile.work_experience?.[0] && (
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                      <Briefcase className="w-3.5 h-3.5 mr-2 text-gray-400" />
                      <span className="truncate">{profile.work_experience[0].company}</span>
                    </div>
                  )}
                  {profile.education?.[0] && (
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg">
                      <GraduationCap className="w-3.5 h-3.5 mr-2 text-gray-400" />
                      <span className="truncate">{profile.education[0].institution}</span>
                    </div>
                  )}
                </div>

                <button className="w-full py-2.5 px-4 bg-white dark:bg-gray-800 border border-blue-600 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900">
                  Connect
                </button>
              </div>
            </div>
          ))}

          {data?.data?.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No alumni found</h3>
              <p>Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
