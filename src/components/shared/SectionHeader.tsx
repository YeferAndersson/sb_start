import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-4">
        {title}
      </h2>
      <p className="text-xl text-gray-400 font-medium">
        {subtitle}
      </p>
    </div>
  );
};

export default SectionHeader;