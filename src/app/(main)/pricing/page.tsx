import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {};

const PricingPage = (props: Props) => {
  const url = "localhost:3000";

  const yearlyPricings = [
    {
      id: 1,
      title: "FREE TRIAL",
      price: 0,
      priceBeforeText: "MAD",
      period: "7-day period",
      periodHeighlight: "",
      features: [
        {
          isActive: true,
          name: "free courses.",
        },
        {
          isActive: true,
          name: "Limited course materials and resources.",
        },
        {
          isActive: true,
          name: "Basic community support.",
        },
        {
          isActive: true,
          name: "No certification upon completion.",
        },
        {
          isActive: true,
          name: "Ad-supported platform.",
        },
        {
          isActive: false,
          name: "Pro Plan community forums.",
        },
        {
          isActive: false,
          name: "Early access to new courses and updates.",
        },
      ],
      isHeighlighted: false,
      isHeighlightedBadge: false,
      buttonText: "FREE TRIAL",
      buttonLink: `http://teaching.${url}/billing?pricing=${1}`,
    },
    {
      id: 2,
      title: "Bronze",
      price: 9,
      priceBeforeText: "MAD",
      period: "7-day period",
      periodHeighlight: "",
      features: [
        {
          isActive: true,
          name: "free courses.",
        },
        {
          isActive: true,
          name: "Limited course materials and resources.",
        },
        {
          isActive: true,
          name: "Basic community support.",
        },
        {
          isActive: true,
          name: "No certification upon completion.",
        },
        {
          isActive: true,
          name: "Ad-supported platform.",
        },
        {
          isActive: true,
          name: "Pro Plan community forums.",
        },
        {
          isActive: true,
          name: "Early access to new courses and updates.",
        },
      ],
      isHeighlighted: false,
      isHeighlightedBadge: false,
      buttonText: "FREE TRIAL",
      buttonLink: `http://teaching.${url}/billing?pricing=${2}`,
    },
    {
      id: 3,
      title: "SILVER",
      price: 12,
      priceBeforeText: "MAD",
      period: "6-months period",
      periodHeighlight: "Premium Support",
      features: [
        {
          isActive: true,
          name: "Unlimited access to all courses.",
        },
        {
          isActive: true,
          name: "course materials and resources.",
        },
        {
          isActive: true,
          name: "Priority support from instructors.",
        },
        {
          isActive: true,
          name: "Course completion certificates.",
        },
        {
          isActive: true,
          name: "Ad-free experience.",
        },
        {
          isActive: true,
          name: "Pro Plan community forums.",
        },
        {
          isActive: true,
          name: "Early access to new courses and updates.",
        },
      ],
      isHeighlighted: true,
      isHeighlightedBadge: false,
      buttonText: "SUBSCRIBE",
      buttonLink: `http://teaching.${url}/billing?pricing=${3}`,
    },
    {
      id: 4,
      title: "GOLD",
      price: 12,
      priceBeforeText: "MAD",
      period: "1-year period",
      periodHeighlight: "Premium Support",
      features: [
        {
          isActive: true,
          name: "Unlimited access to all courses.",
        },
        {
          isActive: true,
          name: "course materials and resources.",
        },
        {
          isActive: true,
          name: "Priority support from instructors.",
        },
        {
          isActive: true,
          name: "Course completion certificates.",
        },
        {
          isActive: true,
          name: "Ad-free experience.",
        },
        {
          isActive: true,
          name: "Pro Plan community forums.",
        },
        {
          isActive: true,
          name: "Early access to new courses and updates.",
        },
      ],
      isHeighlighted: false,
      isHeighlightedBadge: true,
      buttonText: "UPGRADE",
      buttonLink: `http://teaching.${url}/billing?pricing=${4}`,
    },
  ];

  return (
    <main className="py-10 bg-[url('/img/home-page-bg.png')] bg-[no-repeat] bg-[center center] bg-[cover]">
      <h1 className="text-5xl font-bold text-center mt-14 mb-14">
        Our Pricings
      </h1>

      <div className="container mx-auto mt-10">
        <Tabs defaultValue="yearly" className="">
          <TabsList className="grid grid-cols-2 w-[400px] mx-auto mb-10 h-20">
            <TabsTrigger value="monthly" className="py-4 rounded-full">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" className="py-4 rounded-full">
              Yearly
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly"></TabsContent>

          <TabsContent
            value="yearly"
            className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-10"
          >
            {yearlyPricings.length > 0 ? (
              yearlyPricings.map((pricing) => (
                <>
                  <Card
                    className={`${
                      pricing.isHeighlighted
                        ? "border-4 border-themePrimary shadow-2xl"
                        : ""
                    } relative`}
                    key={pricing.id}
                  >
                    {pricing.isHeighlightedBadge && (
                      <div className="absolute -top-7 -right-7">
                        <Image
                          src={
                            "/img/pages/pricing/pricing-highlighted-badge.png"
                          }
                          alt="Pricing Highlighted Badge"
                          className="w-full h-full"
                          width={70}
                          height={70}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-center mt-6">
                        {pricing.title}
                      </CardTitle>
                      <Separator className="bg-black !my-4 block" />
                      <h2 className="text-md text-center text-themePrimary font-light">
                        {pricing.priceBeforeText}
                        <span className="text-6xl">{pricing.price}</span>
                      </h2>
                      <p className="text-md text-center text-[#52575C]">
                        {pricing.period}
                        <br />
                        <span className="text-themePrimary">
                          {pricing.periodHeighlight}
                        </span>
                      </p>
                    </CardHeader>
                    <CardContent>
                      {pricing.features.length > 0 &&
                        pricing.features.map((feature) => (
                          <div
                            className="flex items-center gap-x-4 mb-4"
                            key={feature.name}
                          >
                            {feature.isActive ? (
                              <div className="bg-themePrimary rounded p-1 border border-themePrimary">
                                <CheckIcon />
                              </div>
                            ) : (
                              <div className="rounded p-1 border">
                                <XIcon />
                              </div>
                            )}
                            <span className="text-sm">{feature.name}</span>
                          </div>
                        ))}
                    </CardContent>
                    <CardFooter className="">
                      <Button
                        asChild
                        className={`rounded-full py-6 px-14 border text-white hover:text-black transition-all mx-auto ${
                          pricing.isHeighlightedBadge
                            ? "bg-themePrimary hover:bg-black border-themePrimary hover:border-black"
                            : "bg-black hover:bg-white border-black"
                        }`}
                      >
                        <Link href={pricing.buttonLink}>
                          {pricing.buttonText}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </>
              ))
            ) : (
              <></>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default PricingPage;
