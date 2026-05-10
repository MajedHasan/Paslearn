import React from "react";
import NewsLetterForm from "../forms/newsletterForm";

type Props = {};

const NewsLetter = (props: Props) => {
  return (
    <section className="container mx-auto md:my-32 my-12">
      <h2 className="md:text-2xl text-lg font-semibold text-center">
        Stay one step ahead by subscribing to our newsletter
      </h2>
      <div className="mx-auto flex justify-center mt-7">
        <NewsLetterForm />
      </div>
    </section>
  );
};

export default NewsLetter;
