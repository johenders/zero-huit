"use client";

import { useI18n } from "@/lib/i18n/client";

const steps = [
  { titleKey: "rive.approach.step1.title", bodyKey: "rive.approach.step1.body" },
  { titleKey: "rive.approach.step2.title", bodyKey: "rive.approach.step2.body" },
  { titleKey: "rive.approach.step3.title", bodyKey: "rive.approach.step3.body" },
  { titleKey: "rive.approach.step4.title", bodyKey: "rive.approach.step4.body" },
];

export function ApproachSection() {
  const { t } = useI18n();
  return (
    <section className="relative overflow-hidden bg-white py-20 text-zinc-900">
      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-10">
        <div className="max-w-none">
          <h2 className="text-[2.9rem] font-bold leading-tight sm:text-[3.6rem]">
            {t("rive.approach.title")}
          </h2>
          <p className="mt-5 max-w-6xl text-xs text-zinc-700 sm:text-sm leading-relaxed">
            {t("rive.approach.body.1")}
          </p>
          <p className="mt-2 max-w-6xl text-xs text-zinc-700 sm:text-sm leading-relaxed">
            <span className="font-bold text-black">
              {t("rive.approach.result.label")}
            </span>{" "}
            : {t("rive.approach.result.body")}
          </p>
        </div>

        <div className="mt-14">
          <div className="relative hidden md:block">
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-emerald-200" />
            <div className="relative z-10 grid gap-10 md:grid-cols-4">
              {["1", "2", "3", "4"].map((step) => (
                <div key={step} className="flex items-center justify-start">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-xs font-semibold text-white">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-10 md:grid-cols-4">
            {steps.map((item) => (
              <div key={item.titleKey}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500 text-left">
                  {t(item.titleKey)}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-zinc-600 text-left">
                  {t(item.bodyKey)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center md:justify-end">
          <button
            type="button"
            className="rounded-full bg-gradient-to-r from-[#5cc3d7] to-[#8acd5f] px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20"
          >
            {t("rive.approach.cta")}
          </button>
        </div>
      </div>
    </section>
  );
}
