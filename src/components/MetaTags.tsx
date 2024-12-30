import { Helmet } from 'react-helmet';

interface MetaTagsProps {
  title: string;
  description: string;
  ogImage?: string;
}

const MetaTags = ({ title, description, ogImage = "https://softgames-kirk-assets-sgweb.gamedistribution.com/assets/external-games/uc-jumble-daily-in-color/teaser@2x.jpg" }: MetaTagsProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default MetaTags;