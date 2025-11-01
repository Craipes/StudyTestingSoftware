
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import React from 'react';


interface BreadcrumbItem {
  name: string;
  href?: string; 
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex mt-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.name + index}>
              <div className="flex items-center">
                {index > 0 && (
                  <ChevronRight size={16} className="text-gray-400 dark:text-gray-600 mr-1" />
                )}
                {isLast ? (
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href || '#'} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-500">
                    {item.name}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;