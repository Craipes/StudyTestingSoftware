
import FloatingShapesBackground from '@/components/shared/FloatingShapesBackground';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <div className="bg-transparent relative z-10">
      {children}
      </div>
    </div>
  );
}