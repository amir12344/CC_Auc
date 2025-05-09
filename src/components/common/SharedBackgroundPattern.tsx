interface SharedBackgroundPatternProps {
 className?: string;
}

const SharedBackgroundPattern = ({ className = "" }: SharedBackgroundPatternProps) => (
 <div
  className={`absolute top-0 w-full overflow-hidden z-0 pointer-events-none ${className}`}
 >
  <div className="absolute inset-0 bg-[#102D21] opacity-95"></div>
  <div className="absolute inset-0 bg-linear-to-b from-[#102D21] to-[#102D21]/70"></div>
  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
 </div>
);

export default SharedBackgroundPattern;