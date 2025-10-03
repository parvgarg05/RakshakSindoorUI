import NotificationBadge from '../NotificationBadge';

export default function NotificationBadgeExample() {
  return (
    <div className="p-4 flex gap-4">
      <NotificationBadge type="alert" count={3} onClick={() => console.log('Alert clicked')} />
      <NotificationBadge type="chat" count={12} onClick={() => console.log('Chat clicked')} />
      <NotificationBadge type="alert" count={0} onClick={() => console.log('No alerts')} />
    </div>
  );
}
