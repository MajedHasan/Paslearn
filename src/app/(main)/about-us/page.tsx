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
import React from "react";

type Props = {};

const AboutUsPage = (props: Props) => {
  return (
    <>
      <section className="py-28 container mx-auto">
        <h1 className="text-center lg:text-5xl text-3xl font-bold underline underline-offset-8">
          <span className="text-themePrimary underline">About</span> Course
          creator hub
        </h1>
      </section>
      <section className="container mx-auto">
        <Image
          src={"/img/pages/about/section-02-img.png"}
          alt="Section O2 Image"
          width={1000}
          height={1000}
          className="w-full h-fit"
        />
        <div className="mx-auto w-full max-w-3xl text-center mt-10 mb-28">
          <h2 className="md:text-2xl text-xl font-semibold">
            Our one billion mission sounds bold, We agree.
          </h2>
          <p className="text-sm">
            &ldquo;We cannot solve our problems with the same thinking we used
            when we created them.&rdquo;—Albert Einstein. Institutions are slow
            to change. Committees are where good ideas and innovative thinking
            go to die. Choose agility over dogma. Embrace and drive change. We
            need to wipe the slate clean and begin with bold, radical thinking.
          </p>
        </div>
      </section>
      <section className="bg-[#f1f1f1] py-14">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-3 grid-cols-1 gap-10">
            <div className="">
              <h2 className="lg:text-2xl text-xl font-semibold">
                We Just keep growing with 6.3k Companies
              </h2>
              <p className="text-sm mt-3">
                Institutions are slow to change. Committees are where good ideas
                and innovative thinking go to die.
              </p>
            </div>
            <div className="lg:col-span-2 col-span-1 grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-5">
              <Card>
                <CardContent className="pt-6 h-full flex items-center">
                  <Image
                    src={"/img/pages/about/netflix.png"}
                    alt="Netflix Image"
                    width={1000}
                    height={500}
                    className="w-full h-fit"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 h-full flex items-center">
                  <Image
                    src={"/img/pages/about/youtube.png"}
                    alt="Youtube Image"
                    width={1000}
                    height={500}
                    className="w-full h-fit"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 h-full flex items-center">
                  <Image
                    src={"/img/pages/about/google.png"}
                    alt="Google Image"
                    width={1000}
                    height={500}
                    className="w-full h-fit"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 h-full flex items-center">
                  <Image
                    src={"/img/pages/about/lenovo.png"}
                    alt="Lenovo Image"
                    width={1000}
                    height={500}
                    className="w-full h-fit"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 h-full flex items-center">
                  <Image
                    src={"/img/pages/about/slack.png"}
                    alt="Slack Image"
                    width={1000}
                    height={500}
                    className="w-full h-fit"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 h-full flex items-center">
                  <Image
                    src={"/img/pages/about/verizon.png"}
                    alt="Verizon Image"
                    width={1000}
                    height={500}
                    className="w-full h-fit"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 h-full flex items-center">
                  <Image
                    src={"/img/pages/about/lexmark.png"}
                    alt="Lexmark Image"
                    width={1000}
                    height={500}
                    className="w-full h-fit"
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 h-full flex items-center">
                  <Image
                    src={"/img/pages/about/Microsoft.png"}
                    alt="Lexmark Image"
                    width={1000}
                    height={500}
                    className="w-full h-fit"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8 mt-28">
            <div className="flex gap-4">
              <div>
                <Image
                  src={"/img/pages/about/users.png"}
                  alt="Users"
                  width={150}
                  height={150}
                  className="w-[30px] h-fit"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">67.1k</h2>
                <p className="text-sm">Students</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div>
                <Image
                  src={"/img/pages/about/notebook.png"}
                  alt="Users"
                  width={150}
                  height={150}
                  className="w-[30px] h-fit"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">26k</h2>
                <p className="text-sm">Certified Instructor</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div>
                <Image
                  src={"/img/pages/about/globe-hemisphere-west.png"}
                  alt="Users"
                  width={150}
                  height={150}
                  className="w-[30px] h-fit"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">72</h2>
                <p className="text-sm">Country Language</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div>
                <Image
                  src={"/img/pages/about/circle-wavy-check.png"}
                  alt="Users"
                  width={150}
                  height={150}
                  className="w-[30px] h-fit"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">99.9%</h2>
                <p className="text-sm">Success Rate</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div>
                <Image
                  src={"/img/pages/about/stack.png"}
                  alt="Users"
                  width={150}
                  height={150}
                  className="w-[30px] h-fit"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">57</h2>
                <p className="text-sm">Trusted Companies</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="my-28 container mx-auto">
        <h2 className="lg:text-4xl text-2xl font-semibold underline underline-offset-8">
          Our Goals
        </h2>
        <p className="text-sm mt-4">
          At Course creator hub, our goal is to empower individuals from all
          backgrounds to thrive in the world of design and development. We
          believe that education should be accessible and transformative,
          enabling learners to pursue their passions and make a meaningful
          impact. <br /> Through our carefully crafted courses.
        </p>
        <div className="my-5">
          <Image
            src={"/img/pages/about/section-04-img.png"}
            alt="Growth Picture"
            width={1000}
            height={500}
            className="w-full h-fit"
          />
        </div>
        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10 mt-14">
          <Card>
            <CardHeader>
              <div className="w-fit border border-[#FFEACC] bg-[#FFF9F0] rounded p-3">
                <Image
                  src={"/img/pages/about/book.png"}
                  alt="Book"
                  width={100}
                  height={100}
                  className="w-[40px] h-fit"
                />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle>Foster Creative Problem-Solving</CardTitle>
              <CardDescription className="mt-4">
                We encourage creative thinking and problem-solving abilities,
                allowing our students to tackle real-world challenges with
                confidence and innovation.
              </CardDescription>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <div className="w-fit border border-[#FFEACC] bg-[#FFF9F0] rounded p-3">
                <Image
                  src={"/img/pages/about/puzzlepiece.png"}
                  alt="Book"
                  width={100}
                  height={100}
                  className="w-[40px] h-fit"
                />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle>Promote Collaboration and Community</CardTitle>
              <CardDescription className="mt-4">
                We believe in the power of collaboration and peer learning. Our
                platform fosters a supportive and inclusive community where
                learners can connect, share insights, and grow together.
              </CardDescription>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <div className="w-fit border border-[#FFEACC] bg-[#FFF9F0] rounded p-3">
                <Image
                  src={"/img/pages/about/light-beacon.png"}
                  alt="Book"
                  width={100}
                  height={100}
                  className="w-[40px] h-fit"
                />
              </div>
            </CardHeader>
            <CardContent>
              <CardTitle>Stay Ahead of the Curve</CardTitle>
              <CardDescription className="mt-4">
                The digital landscape is constantly evolving, and we strive to
                stay at the forefront of industry trends. We regularly update
                our course content to ensure our students receive the latest
                knowledge and skills.
              </CardDescription>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        </div>
      </section>
      <section className="my-28 container mx-auto">
        <h2 className="lg:text-5xl text-3xl font-semibold text-center underline underline-offset-8 mb-20">
          Course creator hub
        </h2>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-14 items-center">
          <Image
            src={"/img/pages/about/section-05-img.png"}
            alt="Learning Picture"
            width={1000}
            height={1000}
            className="w-full h-fit"
          />
          <div>
            <p className="text-lg mb-5">
              Once upon a time, nestled in the vast landscape of online
              education, the Course Creator Hub emerged as a beacon of
              opportunity and innovation. It began as a humble initiative,
              driven by a vision to empower both learners and educators alike.
            </p>
            <p className="text-lg mb-5">
              Imagine a world where learning knows no bounds, where individuals
              can tap into the expertise of industry leaders and enhance their
              skills from the comfort of their own space. This was the dream
              that fueled the creation of the Course Creator Hub.
            </p>
            <p className="text-lg mb-5">
              At the heart of our journey lies a simple yet powerful promise: to
              provide a platform where knowledge knows no limits. Whether
              you&apos;re a seasoned teacher looking to share your expertise or
              a passionate learner eager to embark on a new educational
              adventure, the Course Creator Hub welcomes you with open arms.
            </p>
            <p className="text-lg mb-5">
              With our cutting-edge school management software, we&apos;ve
              revolutionized the way traditional and online schools operate.
              From managing scheduling and attendance to handling payments and
              facilitating virtual classrooms, our all-in-one, secure
              cloud-based system simplifies the complexities of educational
              administration.
            </p>
          </div>
        </div>
      </section>
      <section className="my-28 container mx-auto bg-[#f4f4f4] lg:py-20 py-12 lg:px-24 px-14 rounded shadow border">
        <div className="grid lg:grid-cols-3 grid-cols-1 gap-14">
          <div className="lg:col-span-2 col-span-1">
            <h2 className="lg:text-4xl text-2xl font-bold">
              <span className="text-themePrimary">Together</span>, let&apos;s
              shape the future of digital innovation
            </h2>
            <p className="mt-4">
              Join us on this exciting learning journey and unlock your
              potential in design and development.
            </p>
          </div>
          <div className="flex items-end justify-end">
            <Button asChild>
              <Link href={"/"}>Join Now</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUsPage;
