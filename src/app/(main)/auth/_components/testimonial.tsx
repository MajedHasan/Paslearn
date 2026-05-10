import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import React from "react";

type Props = {};

const Testimonial = (props: Props) => {
  return (
    <>
      <div className="px-10">
        <h2 className="lg:text-3xl font-semibold text-xl mb-6">
          Teachers Testimonials
        </h2>
        <div>
          <Carousel className="w-full max-w-md">
            <CarouselContent>
              {Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card>
                      <CardHeader>
                        <CardDescription>
                          The web design course provided a solid foundation for
                          me. The instructors were knowledgeable and supportive,
                          and the interactive learning environment was engaging.
                          I highly recommend it!
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage
                              src="https://github.com/shadcn.png"
                              alt="Testimonial Profile Pic"
                            />
                            <AvatarFallback>PIC</AvatarFallback>
                          </Avatar>
                          <span className="font-bold">Samiya ELBETTACHI</span>
                        </div>
                        <Link
                          href={"/"}
                          className="font-bold underline text-sm italic"
                        >
                          Read More...
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </>
  );
};

export default Testimonial;
