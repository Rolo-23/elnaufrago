import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Booking, BookingStatus } from '../../types';
import { CLOSED_DAYS_OF_WEEK } from '../../constants';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  bookings: Booking[];
}

const CalendarHeader: React.FC<{ currentDate: Date; onPrevMonth: () => void; onNextMonth: () => void; }> = ({ currentDate, onPrevMonth, onNextMonth }) => (
  <div className="flex items-center justify-between mb-4">
    <button onClick={onPrevMonth} className="p-2 rounded-full hover:bg-gray-700 focus:outline-none transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
    </button>
    <h3 className="text-lg font-semibold text-white capitalize">
      {format(currentDate, 'MMMM yyyy', { locale: es })}
    </h3>
    <button onClick={onNextMonth} className="p-2 rounded-full hover:bg-gray-700 focus:outline-none transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
    </button>
  </div>
);

const DaysOfWeek: React.FC = () => (
  <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-400 mb-2">
    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'].map(day => (
      <div key={day}>{day}</div>
    ))}
  </div>
);

export const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, bookings }) => {
  const [currentMonth, setCurrentMonth] = React.useState(startOfMonth(selectedDate));

  React.useEffect(() => {
    setCurrentMonth(startOfMonth(selectedDate));
  }, [selectedDate]);

  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });

  const hasBookingOnDay = (day: Date) => {
    return bookings.some(b => isSameDay(b.startTime, day) && b.status !== BookingStatus.Cancelled && b.status !== BookingStatus.Completed);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <CalendarHeader
        currentDate={currentMonth}
        onPrevMonth={() => setCurrentMonth(subMonths(currentMonth, 1))}
        onNextMonth={() => setCurrentMonth(addMonths(currentMonth, 1))}
      />
      <DaysOfWeek />
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const isClosed = CLOSED_DAYS_OF_WEEK.includes(getDay(day));
          const hasBooking = hasBookingOnDay(day);

          const dayClasses = [
            'w-full h-10 flex items-center justify-center rounded-lg text-sm cursor-pointer relative transition-colors duration-200',
            isCurrentMonth ? 'text-gray-100' : 'text-gray-600 pointer-events-none',
            !isClosed && isCurrentMonth && 'hover:bg-gray-700',
            isClosed && isCurrentMonth && 'text-gray-500 line-through pointer-events-none opacity-50',
            isSelected && 'bg-brand text-gray-900 font-bold',
            isToday && !isSelected && 'text-brand-light font-semibold',
          ].join(' ');

          return (
            <div key={day.toString()} className={dayClasses} onClick={() => !isClosed && onDateChange(day)}>
              <span>{format(day, 'd')}</span>
              {hasBooking && !isSelected && (
                <span className="absolute bottom-1.5 h-1 w-1 bg-brand-light rounded-full"></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};