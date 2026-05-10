import NewsLetter from "@/components/common/newsletter";
import Testimonial from "@/components/common/testimonial";
import Thunder from "@/components/icons/thunder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
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
              <span className="text-themePrimary">Unlock</span> Your Creative
              Potential
            </h1>
          </div>
          <p className="text-center mt-5 max-w-[660px] w-full mx-auto">
            Learn from industry experts and enhance your skills. Share your
            expertise, and we&apos;ll assist you in monetizing it. Whether you
            &apos; re an experienced teacher or an enthusiastic student, embark
            on your journey now
          </p>
          <div className="flex md:flex-row flex-col items-center gap-6 justify-center mt-8">
            <Button
              asChild
              size={"lg"}
              className="bg-gradient-to-r from-[#775B16] from-10% via-[#EFB41F] via-60% to-[#EFB41F] to-90% hover:from-[#EFB41F] hover:to-[#775B16] rounded-2xl font-bold text-lg py-7 px-10 transition-all shadow-xl"
            >
              <Link href={""}>Create Account</Link>
            </Button>
          </div>
        </section>
        {/* Section 02 */}
        <section className="container mx-auto">
          <Image
            src="/img/section-02-thumbnail.png"
            alt="preview img"
            width={1000}
            height={1000}
            className="w-full h-full"
          />
        </section>
        {/* Section 03 */}
        <section className="container mx-auto md:my-20 my-8 grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-10">
          <div className="text-center">
            <h2 className="lg:text-7xl text-3xl font-light bg-gradient-to-r from-themePrimary via-themePrimary to-slate-800 inline-block text-transparent bg-clip-text">
              15K+
            </h2>
            <p className="lg:text-lg text-sm">Students</p>
          </div>
          <div className="text-center">
            <h2 className="lg:text-7xl text-3xl font-light bg-gradient-to-r from-themePrimary via-themePrimary to-slate-800 inline-block text-transparent bg-clip-text">
              75%
            </h2>
            <p className="lg:text-lg text-sm">Total success</p>
          </div>
          <div className="text-center">
            <h2 className="lg:text-7xl text-3xl font-light bg-gradient-to-r from-themePrimary via-themePrimary to-slate-800 inline-block text-transparent bg-clip-text">
              35
            </h2>
            <p className="lg:text-lg text-sm">Main questions</p>
          </div>
          <div className="text-center">
            <h2 className="lg:text-7xl text-3xl font-light bg-gradient-to-r from-themePrimary via-themePrimary to-slate-800 inline-block text-transparent bg-clip-text">
              26
            </h2>
            <p className="lg:text-lg text-sm">Chief experts</p>
          </div>
          <div className="text-center">
            <h2 className="lg:text-7xl text-3xl font-light bg-gradient-to-r from-themePrimary via-themePrimary to-slate-800 inline-block text-transparent bg-clip-text">
              16
            </h2>
            <p className="lg:text-lg text-sm">Years of experience</p>
          </div>
        </section>
        {/* Section 04 */}
        <section className="container mx-auto md:my-20 my-8">
          {/* <div className="mx-auto max-w-[230px] w-full border border-themePrimary py-4 px-1 rounded-full text-center font-bold text-themePrimary text-2xl">
            Road Map
          </div> */}
          <Link
            href={"/road-map"}
            className="mx-auto max-w-[230px] w-full border border-themePrimary py-4 px-1 rounded-full text-center font-bold text-themePrimary text-2xl block hover:bg-themePrimary hover:text-slate-50"
          >
            Road Map
          </Link>
          <div className="text-center mt-16 max-w-lg mx-auto w-full">
            <h2 className="text-[#2F327D] md:text-3xl text-xl font-semibold mb-3">
              All-In-One{" "}
              <span className="text-themePrimary">Cloud Software.</span>
            </h2>
            <p className="text-[#696984]">
              Course creator hub is one powerful online software suite that
              combines all the tools needed to run a successful school or
              office.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-x-10 gap-y-14 lg:px-24 mt-24">
            <div className="rounded-xl shadow-xl bg-slate-50 py-10 px-12 text-center relative">
              <div className="absolute -top-10 left-[40%] rounded-full  w-[70px] h-[70px] bg-[#5B72EE] flex items-center justify-center">
                <Image
                  src="/img/section-04-img-01.png"
                  alt="Image 01"
                  width={20}
                  height={20}
                />
              </div>
              <h2 className="text-[#2F327D] text-2xl mb-5 pt-16">
                Online Billing, Invoicing, & Contracts
              </h2>
              <p className="text-[#696984]">
                Simple and secure control of your organization’s financial and
                legal transactions. Send customized invoices and contracts
              </p>
            </div>
            <div className="rounded-xl shadow-xl bg-slate-50 py-10 px-12 text-center relative">
              <div className="absolute -top-10 left-[40%] rounded-full  w-[70px] h-[70px] bg-[#DAA520] flex items-center justify-center">
                <Image
                  src="/img/section-04-img-02.png"
                  alt="Image 01"
                  width={25}
                  height={25}
                />
              </div>
              <h2 className="text-[#2F327D] text-2xl mb-5 pt-16">
                Easy Scheduling & Attendance Tracking
              </h2>
              <p className="text-[#696984]">
                Schedule and reserve classrooms at one campus or multiple
                campuses. Keep detailed records of student attendance
              </p>
            </div>
            <div className="rounded-xl shadow-xl bg-slate-50 py-10 px-12 text-center relative">
              <div className="absolute -top-10 left-[40%] rounded-full  w-[70px] h-[70px] bg-[#29B9E7] flex items-center justify-center">
                <Image
                  src="/img/section-04-img-03.png"
                  alt="Image 01"
                  width={35}
                  height={35}
                />
              </div>
              <h2 className="text-[#2F327D] text-2xl mb-5 pt-16">
                Customer Tracking
              </h2>
              <p className="text-[#696984]">
                Automate and track emails to individuals or groups. Skilline’s
                built-in system helps organize your organization
              </p>
            </div>
          </div>
        </section>
        {/* Section 05 */}
        <section className="container mx-auto md:my-20 my-8">
          <div className="text-center mt-16 max-w-2xl mx-auto w-full">
            <h2 className="text-[#2F327D] md:text-3xl text-xl font-semibold mb-3">
              What is{" "}
              <span className="text-themePrimary font-light">
                Course creator hub
              </span>
            </h2>
            <p className="text-[#696984]">
              Course creator hub is a platform that allows educators to create
              online classes and courses whereby they can store the course
              materials online; manage assignments, quizzes and exams; monitor
              due dates; grade results and provide students with feedback all in
              one place.
            </p>
          </div>
          <div className="lg:px-20 grid lg:grid-cols-2 grid-cols-1 gap-10 mt-10">
            <div className="rounded-lg bg-[url('/img/section-05-img-01.png')] bg-cover bg-center overflow-hidden">
              <div className="h-[300px] w-full flex items-center justify-center flex-col gap-4 bg-[#171B41]/50 text-slate-50">
                <h2 className="font-semibold">FOR INSTRUCTORS</h2>
                <Button
                  asChild
                  variant={"ghost"}
                  className="border border-slate-50 rounded-full px-8 py-6"
                >
                  <Link href={""} className="font-light">
                    Start a class today
                  </Link>
                </Button>
              </div>
            </div>
            <div className="rounded-lg bg-[url('/img/section-05-img-02.png')] bg-cover bg-center overflow-hidden">
              <div className="h-[300px] w-full flex items-center justify-center flex-col gap-4 bg-[#171B41]/50 text-slate-50">
                <h2 className="font-semibold">FOR STUDENTS</h2>
                <Button
                  asChild
                  variant={"ghost"}
                  className="rounded-full bg-[#23BDEE] px-8 py-6"
                >
                  <Link href={""} className="font-light">
                    Enter access code
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        {/* Section 06 */}
        <section className="container mx-auto md:my-20 my-8">
          <div className="flex gap-10 md:flex-row flex-col items-center">
            <div className="flex-1">
              <h2 className="md:text-3xl text-xl relative z-30">
                <span className="absolute block w-10 h-10 rounded-full bg-[#DAA520] z-20 -top-4 -left-4"></span>
                <span className="relative z-30">
                  Everything you can do in a physical classroom,{" "}
                  <span className="text-[#DAA520]">you can do with </span>
                  Course creator hub
                </span>
              </h2>
              <p className="text-[#696984] mt-4 mb-8">
                Course creator hubs school management software helps traditional
                and online schools manage scheduling, attendance, payments and
                virtual classrooms all in one secure cloud-based system.
              </p>
              <Link href={"/"} className="underline italic">
                Learn more...
              </Link>
            </div>
            <div className="flex-1">
              <Image
                src={"/img/section-06-img.png"}
                alt="Section 06 Image"
                width={500}
                height={500}
              />
            </div>
          </div>
        </section>

        {/* Section 07 */}
        <section className="container mx-auto md:my-20 my-8">
          <div className="text-center">
            <h2 className="md:text-3xl text-xl font-bold text-[#2F327D]">
              Our <span className="text-[#DAA520]">Features</span>
            </h2>
            <p className="text-[#696984] mt-3">
              This very extraordinary feature, can make learning activities more
              efficient
            </p>
          </div>
          <div className="flex md:flex-row flex-col lg:gap-20 md:gap-10 gap-4 items-center justify-between mt-10">
            <div className="flex-1">
              <Image
                src={"/img/section-07-img.png"}
                alt="Section 06 Image"
                width={500}
                height={500}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <h2 className="lg:text-3xl md:text-2xl text-xl font-bold">
                Why you’ll start teaching on <br />{" "}
                <span className="font-normal text-themePrimary">
                  Course creator hub{" "}
                </span>
              </h2>
              <ul className="max-w-md flex flex-col gap-6 mt-8">
                <li className="flex items-center gap-5">
                  <span className="rounded-full p-4 shadow bg-white flex items-center justify-center">
                    <Image
                      src={"/img/section-07-icon-01.png"}
                      alt="Icon"
                      width={25}
                      height={25}
                    />
                  </span>
                  <p className="text-[#696984]">
                    we provide a plateform for you to present your courses
                  </p>
                </li>
                <li className="flex items-center gap-5">
                  <span className="rounded-full p-4 shadow bg-white flex items-center justify-center">
                    <Image
                      src={"/img/section-07-icon-02.png"}
                      alt="Icon"
                      width={25}
                      height={25}
                    />
                  </span>
                  <p className="text-[#696984]">
                    we help you with providing marketing strategies
                  </p>
                </li>
                <li className="flex items-center gap-5">
                  <span className="rounded-full p-4 shadow bg-white flex items-center justify-center">
                    <Image
                      src={"/img/section-07-icon-03.png"}
                      alt="Icon"
                      width={25}
                      height={25}
                    />
                  </span>
                  <p className="text-[#696984]">
                    Teachers can easily see all students and class data at one
                    time.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 08 */}
        <section className="container mx-auto md:my-20 my-8">
          <div className="flex items-center justify-between gap-10 lg:flex-row flex-col">
            <div className="flex-1">
              <h2 className="md:text-3xl text-xl font-bold text-[#2F327D]">
                <span className="text-[#DAA520]">Tools</span> For Teachers{" "}
                <br /> And Learners
              </h2>
              <p className="text-[#696984] mt-8 max-w-md leading-7">
                Class has a dynamic set of teaching tools built to be deployed
                and used during class. Teachers can handout assignments in
                real-time for students to complete and submit.
              </p>
            </div>
            <div className="flex-1">
              <Image
                src={"/img/section-08-img.png"}
                alt="Course Creation Hub"
                width={400}
                height={400}
                className="w-full"
              />
            </div>
          </div>
        </section>
        {/* Section 08 */}

        {/* Section 09 */}
        <section className="container mx-auto md:my-20 my-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 grid-cols-1">
            <div className="flex-1 w-full">
              <Image
                src={"/img/section-09-img.png"}
                alt="Course Creation Hub"
                width={400}
                height={400}
                className="w-full"
              />
            </div>
            <div className="flex-1 w-full">
              <h2 className="md:text-3xl text-xl font-bold text-[#2F327D]">
                Assessments,
                <br />
                <span className="text-[#DAA520]">Quizzes,</span>
                Tests
              </h2>
              <p className="text-[#696984] mt-8 max-w-md leading-7">
                Easily launch live assignments, quizzes, and tests. Student
                results are automatically entered in the online gradebook.
              </p>
            </div>
          </div>
        </section>
        {/* Section 09 */}

        {/* Section 10 */}
        <section className="container mx-auto md:my-20 my-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 grid-cols-1">
            <div className="flex-1 w-full">
              <h2 className="md:text-3xl text-xl font-bold text-[#2F327D]">
                <span className="text-[#DAA520]">Class Management</span>
                <br />
                Tools for Educators
              </h2>
              <p className="text-[#696984] mt-8 max-w-md leading-7">
                Class provides tools to help run and manage the class such as
                Class Roster, Attendance, and more. With the Gradebook, teachers
                can review and grade tests and quizzes in real-time.
              </p>
            </div>
            <div className="flex-1 w-full">
              <Image
                src={"/img/section-10-img.png"}
                alt="Course Creation Hub"
                width={400}
                height={400}
                className="w-full"
              />
            </div>
          </div>
        </section>
        {/* Section 10 */}

        {/* Section 11 */}
        <section className="container mx-auto md:my-20 my-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 grid-cols-1">
            <div className="flex-1 w-full">
              <Image
                src={"/img/section-11-img.png"}
                alt="Course Creation Hub"
                width={400}
                height={400}
                className="w-full"
              />
            </div>
            <div className="flex-1 w-full">
              <h2 className="md:text-3xl text-xl font-bold text-[#2F327D]">
                One-on-One
                <br />
                <span className="text-[#DAA520]">Discussions</span>
              </h2>
              <p className="text-[#696984] mt-8 max-w-md leading-7">
                Teachers and teacher assistants can talk with students privately
                without leaving the environment.
              </p>
            </div>
          </div>
        </section>
        {/* Section 11 */}

        {/* Road Map Button */}
        <section className="container mx-auto md:my-20 my-8">
          <Link
            href={"/road-map"}
            className="mx-auto max-w-[230px] w-full border border-themePrimary py-4 px-1 rounded-full text-center font-bold text-themePrimary text-2xl block hover:bg-themePrimary hover:text-slate-50"
          >
            Road Map
          </Link>
        </section>
        {/* Road Map Button */}

        <Testimonial />
        <NewsLetter />
      </main>
    </>
  );
}
