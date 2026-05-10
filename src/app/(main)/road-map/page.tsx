import Testimonial from "@/components/common/testimonial";
import Thunder from "@/components/icons/thunder";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function RoadMap() {
  return (
    <>
      <main className="py-10 bg-[url('/img/home-page-bg.png')] bg-[no-repeat] bg-[center center] bg-[cover]">
        {/* Section 01 */}
        <section className="container mx-auto md:py-24 py-10">
          <div className="bg-[#FCFCFD] rounded md:p-5 p-2 max-w-fit w-full mx-auto flex items-center gap-5">
            <div className="bg-[#FAE3C3] rounded md:p-3 p-1">
              <Thunder />
            </div>
            <h1 className="text-[#1A1A1A] md:text-4xl text-xl font-bold">
              <span className="text-themePrimary">Road </span>
              Map
            </h1>
          </div>
          <p className="text-center mt-5 max-w-[550px] w-full mx-auto">
            Learn from Industry Experts and Enhance Your Skills & Share what you
            know; we&apos;ll help you get paid for it
          </p>
        </section>
        {/* Section 01 */}

        {/* Section 02 */}
        <section className="container mx-auto md:my-20 my-8">
          <h1 className="text-4xl font-bold">Step 1 : Registration </h1>
          <div className="flex items-center justify-between gap-10 lg:flex-row flex-col">
            <div className="flex-1">
              <h2 className="md:text-3xl text-xl font-semibold text-[#2F327D] relative">
                <span className="block w-16 h-16 rounded-full bg-[#DAA520] absolute z-10 -top-5 -left-5"></span>
                <span className="z-20 relative">Begin by creating your</span>
                <span className="text-[#DAA520]"> account</span>
              </h2>
              <p className="text-[#696984] mt-8 max-w-md leading-7">
                After completing the sign-up process, you will be prompted to
                provide your student details. Take the next step by filling out
                the required information about yourself as a student.
              </p>
              <Link href={"/"} className="mt-4 block underline text-[#696984]">
                Learn more
              </Link>
            </div>
            <div className="flex-1">
              <Image
                src={"/img/pages/road-map/section-01.png"}
                alt="Course Creation Hub"
                width={1000}
                height={1000}
                className="w-full"
              />
            </div>
          </div>
        </section>
        {/* Section 02 */}

        {/* Section 03 */}
        <section className="container mx-auto md:my-20 my-8">
          <h1 className="text-4xl font-bold mb-4">Step 2: Become a teacher</h1>
          <div className="flex items-center justify-between gap-20 lg:flex-row flex-col">
            <div className="flex-1">
              <Image
                src={"/img/pages/road-map/section-02.png"}
                alt="Course Creation Hub"
                width={1000}
                height={1000}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <h2 className="md:text-3xl text-xl font-semibold text-[#2F327D] relative">
                <span className="block w-16 h-16 rounded-full bg-[#DAA520] absolute z-10 -top-5 -left-5"></span>
                <span className="z-20 relative">
                  Becoming a{" "}
                  <span className="text-[#DAA520]">Teacher with</span> <br />
                  course Creator Hub
                </span>
              </h2>
              <p className="text-[#696984] mt-8 max-w-md leading-7">
                Accessible from the previous page under &ldquo;Become a
                Teacher.&rdquo; Proceed to fill in your professional details and
                submit articles relevant to your field
              </p>
            </div>
          </div>
        </section>
        {/* Section 03 */}

        {/* Section 04 */}
        <section className="container mx-auto md:my-20 my-8">
          <h1 className="text-4xl font-bold">Step 3: Select a Plan</h1>
          <div className="flex items-center justify-between gap-10 lg:flex-row flex-col">
            <div className="flex-1">
              <h2 className="md:text-3xl text-xl font-semibold text-[#2F327D] relative">
                <span className="block w-16 h-16 rounded-full bg-[#DAA520] absolute z-10 -top-5 -left-5"></span>
                <span className="z-20 relative"> Choose your</span>
                <span className="text-[#DAA520]"> plan</span>
              </h2>
              <p className="text-[#696984] mt-8 max-w-md leading-7">
                After completing all your information, choose the plan that best
                fits your needs.
              </p>
              <Link href={"/"} className="mt-4 block underline text-[#696984]">
                Learn more
              </Link>
            </div>
            <div className="flex-1">
              <Image
                src={"/img/pages/road-map/section-03.png"}
                alt="Course Creation Hub"
                width={1000}
                height={1000}
                className="w-full"
              />
            </div>
          </div>
        </section>
        {/* Section 04 */}

        {/* Section 05 */}
        <section className="container mx-auto md:my-20 my-8">
          <h1 className="text-4xl font-bold mb-6">
            Step 4: Choose your Template
          </h1>
          <div className="flex items-center justify-between gap-20 lg:flex-row flex-col">
            <div className="flex-1">
              <Image
                src={"/img/pages/road-map/section-05.png"}
                alt="Course Creation Hub"
                width={1000}
                height={1000}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <h2 className="md:text-3xl text-xl font-semibold text-[#2F327D] relative">
                <span className="block w-16 h-16 rounded-full bg-[#DAA520] absolute z-10 -top-5 -left-5"></span>
                <span className="z-20 relative">
                  Customize Your{" "}
                  <span className="text-[#DAA520]"> Template</span>
                  <br /> with{" "}
                  <span className="font-thin">Course creator hub</span>
                </span>
              </h2>
              <p className="text-[#696984] mt-8 max-w-md leading-7">
                Select a template that suits your preferences and customize it
                to your liking. Personalize it by adding features that meet your
                specific requirements.
              </p>
            </div>
          </div>
        </section>
        {/* Section 05 */}

        {/* Section 06 */}
        <section className="container mx-auto md:my-20 my-8">
          <h1 className="text-4xl font-bold">
            Final Step 5: Personalize Your <br /> Own Website{" "}
          </h1>
          <div className="flex items-center justify-between gap-10 lg:flex-row flex-col">
            <div className="flex-1">
              <h2 className="md:text-3xl text-xl font-semibold text-[#2F327D] relative">
                <span className="block w-16 h-16 rounded-full bg-[#DAA520] absolute z-10 -top-5 -left-5"></span>
                <span className="z-20 relative">Personilized your</span>
                <span className="text-[#DAA520]"> Webiste</span>
              </h2>
              <p className="text-[#696984] mt-8 max-w-md leading-7">
                Once you&apos;ve chosen your template, continue editing your
                website to tailor it to your needs. Save your progress and
                proceed to create your domain name and link for your
                personalized website.
              </p>
              <Link href={"/"} className="mt-4 block underline text-[#696984]">
                Learn more
              </Link>
            </div>
            <div className="flex-1">
              <Image
                src={"/img/pages/road-map/section-06.png"}
                alt="Course Creation Hub"
                width={1000}
                height={1000}
                className="w-full"
              />
            </div>
          </div>
        </section>
        {/* Section 06 */}

        <div className="flex md:flex-row flex-col items-center gap-6 justify-center mt-8">
          <Button
            asChild
            size={"lg"}
            className="bg-gradient-to-r from-[#775B16] from-10% via-[#EFB41F] via-60% to-[#EFB41F] to-90% hover:from-[#EFB41F] hover:to-[#775B16] rounded-2xl font-bold text-lg py-7 px-10 transition-all shadow-xl"
          >
            <Link href={""}>Create Account</Link>
          </Button>
        </div>

        <Testimonial />
      </main>
    </>
  );
}
