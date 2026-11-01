import { Reveal } from "@/components/ui/Reveal";

export function PageHeader({
  eyebrow,
  title,
  accent,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  /** Optional italic serif word(s) appended to the title. */
  accent?: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="container-x pt-32 pb-14 md:pt-44 md:pb-20">
      <Reveal>
        <p className="label mb-8">{eyebrow}</p>
        <h1 className="text-headline max-w-5xl font-medium md:text-[clamp(3rem,7vw,7.5rem)]">
          {title}
          {accent && (
            <>
              {" "}
              <span className="font-serif font-normal italic text-paper-dim">{accent}</span>
            </>
          )}
        </h1>
        {intro && <p className="mt-8 max-w-2xl text-lg text-paper-dim md:text-xl">{intro}</p>}
      </Reveal>
      {children && <div className="mt-12">{children}</div>}
    </header>
  );
}
