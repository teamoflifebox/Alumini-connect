import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, CreateEventDTO } from '../../../api/events';
import type { Event } from '../../../api/events';
import { useAuth } from '../../../hooks/useAuth';
import { Calendar, Clock, MapPin, Users, Plus, Trash2, Video, CheckCircle } from 'lucide-react';

export default function EventsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: eventsApi.getAll,
  });

  const { data: myEvents } = useQuery({
    queryKey: ['my-events'],
    queryFn: eventsApi.getMyEvents,
    enabled: !!user,
  });

  const myEventIds = new Set(myEvents?.map(e => e.id) || []);

  const createMutation = useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowCreate(false);
    },
  });

  const registerMutation = useMutation({
    mutationFn: eventsApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: eventsApi.unregister,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: eventsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const [formData, setFormData] = useState<CreateEventDTO>({
    title: '',
    description: '',
    event_type: 'Meetup',
    start_time: '',
    end_time: '',
    location_type: 'Online',
    location_details: '',
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: new Date(formData.end_time).toISOString(),
    });
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading events...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Community Events</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2 transition"
        >
          {showCreate ? 'Cancel' : <><Plus className="w-5 h-5" /> Post Event</>}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create New Event</h2>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
                <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.event_type} onChange={e => setFormData({...formData, event_type: e.target.value})}>
                  <option>Meetup</option>
                  <option>Webinar</option>
                  <option>Reunion</option>
                  <option>Workshop</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                <input required type="datetime-local" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                <input required type="datetime-local" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location Type</label>
                <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.location_type} onChange={e => setFormData({...formData, location_type: e.target.value})}>
                  <option>Online</option>
                  <option>In-Person</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location Details (Meet Link or Address)</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.location_details} onChange={e => setFormData({...formData, location_details: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea required rows={3} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <button disabled={createMutation.isPending} type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition">
              {createMutation.isPending ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((event: Event) => {
          const isRegistered = myEventIds.has(event.id);
          const isOrganizer = user && user.id === event.organizer_id;
          const isOnline = event.location_type === 'Online';
          const now = new Date();
          const start = new Date(event.start_time);
          const end = new Date(event.end_time);
          const isOngoing = now >= start && now <= end;
          const isPast = now > end;

          return (
            <div key={event.id} className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border transition-all ${isOngoing ? 'border-green-500 shadow-green-100 dark:shadow-none' : 'border-gray-100 dark:border-gray-700'} relative overflow-hidden group hover:shadow-md`}>
              {isOngoing && <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 font-semibold rounded-bl-lg">Ongoing</div>}
              {isPast && <div className="absolute top-0 right-0 bg-gray-500 text-white text-xs px-3 py-1 font-semibold rounded-bl-lg">Past</div>}

              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{event.title}</h3>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full dark:bg-indigo-900/30 dark:text-indigo-300 whitespace-nowrap ml-2">
                  {event.event_type}
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
              
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {start.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center gap-2">
                  {isOnline ? <Video className="w-4 h-4 text-blue-500" /> : <MapPin className="w-4 h-4 text-red-500" />}
                  <span className="truncate">
                    {isRegistered || isOrganizer ? (
                      isOnline ? <a href={event.location_details} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Join Meeting</a> : event.location_details
                    ) : (
                      isOnline ? 'Online Meeting (Register to view link)' : event.location_details
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-3">
                  {isRegistered ? (
                    <button
                      onClick={() => unregisterMutation.mutate(event.id)}
                      disabled={unregisterMutation.isPending || isPast}
                      className="flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> Registered
                    </button>
                  ) : (
                    <button
                      onClick={() => registerMutation.mutate(event.id)}
                      disabled={registerMutation.isPending || isPast}
                      className="text-sm font-medium text-white bg-primary hover:bg-primary/90 px-4 py-1.5 rounded-lg transition shadow-sm disabled:opacity-50 disabled:bg-gray-400"
                    >
                      {isPast ? 'Ended' : 'Register Now'}
                    </button>
                  )}
                </div>

                {isOrganizer && (
                  <button
                    onClick={() => deleteMutation.mutate(event.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition dark:hover:bg-red-900/20"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {events?.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            No events found. Be the first to create one!
          </div>
        )}
      </div>
    </div>
  );
}
