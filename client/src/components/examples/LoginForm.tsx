import LoginForm from '../LoginForm';

export default function LoginFormExample() {
  return (
    <div className="p-4 min-h-screen flex items-center justify-center bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div>
          <h3 className="text-lg font-semibold mb-4">Soldier Login</h3>
          <LoginForm 
            role="soldier"
            language="en"
            onLogin={(u, p, r) => console.log('Soldier login:', u, r)}
            onBack={() => console.log('Back clicked')}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Civilian Login</h3>
          <LoginForm 
            role="civilian"
            language="en"
            onLogin={(u, p, r) => console.log('Civilian login:', u, r)}
            onBack={() => console.log('Back clicked')}
          />
        </div>
      </div>
    </div>
  );
}
