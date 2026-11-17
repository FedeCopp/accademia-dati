"use client";

// Demo di riferimento del componente (dalla documentazione Motiq). Non è usata nelle pagine:
// mostra come combinare la variante "display" e la variante "terminal".
import { DecryptText } from "@/components/ui/decrypt-text";

export default function DecryptTextDemo() {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-10 p-12">
      <DecryptText
        as="h1"
        text="Ship motion that feels engineered"
        variant="display"
        trigger="mount"
        stagger={38}
        retriggerOnHover
        className="max-w-2xl text-center text-4xl font-semibold tracking-tight text-[var(--motiq-fg)] sm:text-5xl"
      />

      <DecryptText
        text="npx shadcn@latest add https://motiq.dev/r/decrypt-text"
        variant="terminal"
        trigger="mount"
        startDelay={600}
        loop={5200}
        className="w-full max-w-xl"
      />
    </div>
  );
}
