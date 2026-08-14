import StaticPage from '@/components/layout/StaticPage';

export default function About() {
  return (
    <StaticPage
      eyebrow="Notre Histoire"
      title="A House Built on Restraint"
      metaDescription="The story of L'Or Noir — a fragrance house founded on rare materials, small batches, and restraint."
      maxWidth="max-w-2xl"
    >
      <p>
        L'Or Noir began with a disagreement. Our founding perfumer had spent a
        decade formulating for larger houses, watching briefs get diluted at
        every stage — batch sizes grew, rare materials got replaced with
        cheaper analogues, and "signature" scents started smelling like
        variations on the same six accords. In 2019, she left to build
        something smaller on purpose.
      </p>

      <h2>Small batches, deliberately</h2>
      <p>
        Every composition we release is mixed in batches under 500 bottles.
        Not as a marketing device — it's simply the largest batch size that
        lets us keep sourcing Cambodian oud, Mysore sandalwood, and orris root
        the way we want to, from suppliers we've worked with for years rather
        than whoever has stock this quarter.
      </p>

      <h2>What "L'Or Noir" means</h2>
      <p>
        The name is a small contradiction on purpose — black gold. Our
        palette is obsidian and champagne, but the philosophy is the same
        tension: dark, resinous materials (oud, leather, incense) built with
        a light hand, so nothing in the collection reads as heavy-handed or
        loud for its own sake.
      </p>

      <h2>Where we are now</h2>
      <p>
        Today the house is still small — a handful of perfumers, one atelier,
        and four collaborating maisons whose work we admire enough to carry
        alongside our own. We ship to over 40 countries, but we've turned
        down retail partnerships that would have required us to double batch
        sizes. That trade felt obvious.
      </p>
    </StaticPage>
  );
}
