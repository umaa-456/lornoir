import StaticPage from '@/components/layout/StaticPage';

export default function Sustainability() {
  return (
    <StaticPage
      eyebrow="Our Commitments"
      title="Sustainability"
      metaDescription="How L'Or Noir sources materials and packages fragrance responsibly."
      maxWidth="max-w-2xl"
    >
      <p>
        Rare materials and sustainability aren't always in tension — but they
        require paying attention to where things come from, not just what
        they cost.
      </p>

      <h2>Sourcing</h2>
      <p>
        Our oud comes from suppliers who practice selective harvesting
        rather than clear-cutting Aquilaria trees, and who replant at a
        higher ratio than they harvest. We've worked with the same
        sandalwood cooperative in Mysore for over five years, which lets us
        track exactly which plantation a given batch came from.
      </p>

      <h2>Packaging</h2>
      <ul>
        <li>Bottles are weighted glass, designed to be refilled rather than discarded</li>
        <li>Outer boxes use FSC-certified paper stock and soy-based inks</li>
        <li>We stopped using cellophane box wrap in 2023</li>
      </ul>

      <h2>Cruelty-free, always</h2>
      <p>
        Every composition is formulated and finished without animal testing,
        and we only work with ingredient suppliers who meet the same
        standard.
      </p>

      <h2>Where we're still working</h2>
      <p>
        We don't have carbon-neutral shipping yet — international logistics
        for a company our size makes that harder than it sounds, but it's on
        the roadmap. We'd rather say that plainly than make a claim we can't
        back up.
      </p>
    </StaticPage>
  );
}
