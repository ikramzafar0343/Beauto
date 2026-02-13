'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqData = [
  {
    question: "What is Beauto and how does it work?",
    answer: "Beauto is an intelligent AI agent that integrates seamlessly with your favorite applications to automate workflows. Powered by Composio, it connects securely to tools like Slack, Gmail, Notion, and more, enabling you to execute complex tasks through simple natural language commands."
  },
  {
    question: "How do I get started with Beauto?",
    answer: "Starting with Beauto is straightforward. Simply click the 'Get Started' button, log in, and browse the available integrations. Connect the apps you use daily, and you can immediately begin automating tasks by typing requests into the Beauto interface."
  },
  {
    question: "What can I use Beauto for?",
    answer: "Beauto is versatile and can handle various tasks such as summarizing daily emails, drafting and sending responses, scheduling calendar events, managing tasks in Notion, posting updates to social media, and orchestrating multi-step workflows across different platforms."
  },
  {
    question: "What is Composio? How is it related to Beauto?",
    answer: "Composio is the secure integration infrastructure that powers Beauto. It provides the reliable connectivity layer allowing AI agents to interact with external tools and APIs, ensuring that your data flows securely and efficiently between applications."
  },
  {
    question: "How secure is my data with Composio?",
    answer: "Security is paramount. Composio employs enterprise-grade encryption for data in transit and at rest. We adhere to strict compliance standards (SOC 2 Type II) to ensure your information remains protected. Your data is yours; we do not use it to train our models without consent."
  },
  {
    question: "How is my data handled during processing?",
    answer: "Your data is processed transiently solely to execute your commands. We practice data minimization, retaining only what is necessary for the service to function. Authentication tokens are stored securely using industry-standard encryption protocols."
  },
  {
    question: "Do I need technical skills to set up Beauto?",
    answer: "No technical skills are required. Beauto is designed for everyone. The setup process involves simple authentication steps similar to logging into your apps, and interacting with Beauto is as easy as chatting with a colleague."
  },
  {
    question: "Can I use multiple apps at the same time?",
    answer: "Absolutely. One of Beauto's key strengths is its ability to chain actions across different apps. For example, you can ask it to 'read my latest email from John and create a task in Notion with the summary,' utilizing both Gmail and Notion in a single workflow."
  },
  {
    question: "Is Beauto free to use? What are the limits?",
    answer: "Beauto offers a generous free tier for individuals to explore its capabilities. For heavy users and teams requiring advanced features, higher rate limits, and priority support, we offer scalable premium plans. Please visit our Pricing page for more details."
  },
  {
    question: "What if my app isn't supported?",
    answer: "We are constantly expanding our library of supported integrations. If a tool you need isn't currently available, you can submit a request through our support channels. We prioritize new integrations based on user demand and community feedback."
  },
  {
    question: "How do I get help if something goes wrong?",
    answer: "If you encounter any issues, our comprehensive documentation is a great place to start. Additionally, you can join our active community on Discord for peer support or reach out directly to our support team via email for personalized assistance."
  }
];

export default function FAQSection() {
  const [openIndices, setOpenIndices] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenIndices((prev) => 
      prev.includes(index) 
        ? prev.filter((i) => i !== index) 
        : [...prev, index]
    );
  };

  return (
    <section className="relative w-full py-16 px-4 md:py-24 md:px-8 bg-white z-10">
      <div className="max-w-[1024px] mx-auto">
        <h2 className="text-center font-[family-name:var(--font-display)] text-[32px] sm:text-[40px] md:text-[48px] font-medium leading-tight text-[#1A1A1A] mb-8 md:mb-12 tracking-[-0.96px]">
          Got <span className="italic">something</span> on your mind?
        </h2>

        <div className="flex flex-col gap-3">
          {faqData.map((item, index) => {
            const isOpen = openIndices.includes(index);
            return (
              <div
                key={index}
                className="group border border-[#E5E5E5] rounded-[12px] bg-white transition-colors duration-200 hover:border-[#D0D0D0]"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 text-left cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-[family-name:var(--font-body)] text-[16px] md:text-[18px] font-medium text-[#666666] group-hover:text-[#1A1A1A] transition-colors duration-200">
                    {item.question}
                  </span>
                  <div className={`flex-shrink-0 ml-4 text-[#666666] transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
                  </div>
                </button>
                
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 md:px-6 md:pb-6 pt-0">
                      <p className="font-[family-name:var(--font-body)] text-[14px] md:text-[16px] leading-[1.6] text-[#666666]">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}