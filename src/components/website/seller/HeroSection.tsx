import Link from "next/link";

export const HeroSection = () => {
  return (
    <section
      className="relative z-10 w-full py-10 text-white sm:py-16 md:py-24 lg:py-28"
      style={{ paddingBottom: "0px" }}
    >
      <div className="container mx-auto mt-[5rem] px-4 md:mt-[2rem]">
        <div className="mb-4 text-center">
          <div className="mb-6 inline-block rounded-full bg-[#43CD66]/20 px-4 py-1">
            <span className="text-sm font-medium text-[#43CD66]">
              FOR SELLERS
            </span>
          </div>
          <h1 className="mb-6 text-3xl leading-tight font-bold md:text-5xl lg:text-6xl">
            Make Your Inventory Work for You,{" "}
            <span className="relative inline-block text-[#43CD66]">
              <span className="relative z-10">Not Against You</span>
              <span className="absolute bottom-1 left-0 -z-0 h-3 w-full bg-[#43CD66]/20"></span>
            </span>
          </h1>
          <p className="text-md mx-auto mb-8 max-w-3xl leading-relaxed text-gray-200 md:text-xl">
            Commerce Central helps brands recover margin and clear space from
            excess and returned inventory without flooding the wrong channels or
            giving up control.
          </p>
          <div className="mb-12 flex justify-center">
            <Link
              href="/auth/seller-signup"
              className="flex items-center justify-center rounded-full bg-[#43CD66] px-4 py-2.5 text-sm font-medium text-[#1C1E21] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#43CD66] hover:text-[#ffff] hover:shadow-xl sm:px-5 sm:text-base md:px-6 md:py-3 md:text-lg"
            >
              <span>Sell on Commerce Central</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
