import ActivityChart from '../ActivityChart';

export default function ActivityChartExample() {
  const mockData = [
    { time: '00:00', value: 4 },
    { time: '04:00', value: 2 },
    { time: '08:00', value: 8 },
    { time: '12:00', value: 12 },
    { time: '16:00', value: 15 },
    { time: '20:00', value: 9 },
    { time: '24:00', value: 6 },
  ];

  return (
    <div className="p-4">
      <ActivityChart data={mockData} />
    </div>
  );
}
