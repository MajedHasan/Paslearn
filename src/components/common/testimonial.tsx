import { ArrowRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {};

const Testimonial = (props: Props) => {
  return (
    <section className="container mx-auto md:my-20 my-8">
      <div className="grid items-center gap-10 lg:grid-cols-2 grid-cols-1">
        <div className="flex-1 w-full">
          <p className="text-[#525596]">TESTIMONIAL</p>
          <h2 className="md:text-5xl text-xl text-[#010203] font-bold mt-4 mb-7">
            What They Say?
          </h2>
          <p>
            Course creator hub has got more than 100k <br /> positive ratings
            from our users around the <br /> world.
          </p>
          <p className="mb-3 mt-2">
            Some of the students and teachers were <br /> greatly helped by the
            Skilline.
          </p>
          <p>Are you too? Please give your assessment</p>
          <div className="mt-12">
            <Link
              href={"/"}
              className="rounded-full text-[#DAA520] pl-6 border border-[#DAA520] flex w-fit gap-6 items-center group hover:bg-[#DAA520] transition-all"
            >
              <span className="group-hover:text-white transition-all">
                Write your assessment
              </span>
              <ArrowRight className="border border-[#DAA520] rounded-full w-12 h-12 p-3 group-hover:border-white group-hover:text-white transition-all" />
            </Link>
          </div>
        </div>
        <div className="flex-1 w-full relative">
          <div>
            <Image
              src={"/img/testimonial/1.png"}
              alt="Testimonial 1"
              width={400}
              height={400}
              className="w-full rounded-2xl relative z-10 -ml-16"
            />
          </div>
          <div className="bg-white border-l-8 border-[#F67766] py-8 px-6 shadow -mt-10 relative z-20 rounded-xl">
            <p className="text-[#5F5F7E]">
              <span className="text-2xl">&ldquo;</span>Thank you so much for
              your help. It&apos;s exactly what I&apos;ve been looking for. You
              won&apos;t regret it. It really saves me time and effort. Course
              creator hub is exactly what our business has been lacking.{" "}
              <span className="text-2xl">&rdquo;</span>
            </p>
            <div className="flex items-center justify-between gap-10 w-full mt-5">
              <span className="text-[#5F5F7E] font-semibold">Gloria Rose</span>
              <div>
                <div className="flex items-center gap-1">
                  <Star className="text-[#FBA333] w-4" />
                  <Star className="text-[#FBA333] w-4" />
                  <Star className="text-[#FBA333] w-4" />
                  <Star className="text-[#FBA333] w-4" />
                  <Star className="text-[#FBA333] w-4" />
                </div>
                <span className="text-[#80819A] text-xs">
                  12 reviews at Yelp
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
