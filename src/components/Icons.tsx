import React from 'react';

interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const defaultProps: IconProps = { size: 18, strokeWidth: 1.8 };

const svgBase = (props: IconProps, children: React.ReactNode) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || defaultProps.size}
    height={props.size || defaultProps.size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={props.strokeWidth || defaultProps.strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    {children}
  </svg>
);

// Sidebar Icons
export const FolderIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></>);

export const FolderOpenIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M6 14l1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v1" /></>);

export const FileTextIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 13H8" /><path d="M16 17H8" /><path d="M16 13h-2" /></>);

export const SearchIcon = (props: IconProps = {}) =>
  svgBase(props, <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>);

export const PlusIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M5 12h14" /><path d="M12 5v14" /></>);

export const FilePlusIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M12 18v-6" /><path d="M9 15h6" /></>);

export const FolderPlusIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M12 10v6" /><path d="M9 13h6" /><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></>);

export const ChevronRightIcon = (props: IconProps = {}) =>
  svgBase({ ...props, size: props.size || 14 }, <><path d="m9 18 6-6-6-6" /></>);

export const ChevronLeftIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="m15 18-6-6 6-6" /></>);

export const ChevronDownIcon = (props: IconProps = {}) =>
  svgBase({ ...props, size: props.size || 14 }, <><path d="m6 9 6 6 6-6" /></>);

export const PanelLeftCloseIcon = (props: IconProps = {}) =>
  svgBase(props, <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /><path d="m16 15-3-3 3-3" /></>);

export const PanelLeftOpenIcon = (props: IconProps = {}) =>
  svgBase(props, <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /><path d="m14 9 3 3-3 3" /></>);

export const MenuIcon = (props: IconProps = {}) =>
  svgBase(props, <><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></>);

export const PencilIcon = (props: IconProps = {}) =>
  svgBase({ ...props, size: props.size || 14 }, <><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /></>);

export const TrashIcon = (props: IconProps = {}) =>
  svgBase({ ...props, size: props.size || 14 }, <><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></>);

// Editor Toolbar Icons
export const BoldIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" /></>);

export const ItalicIcon = (props: IconProps = {}) =>
  svgBase(props, <><line x1="19" x2="10" y1="4" y2="4" /><line x1="14" x2="5" y1="20" y2="20" /><line x1="15" x2="9" y1="4" y2="20" /></>);

export const StrikethroughIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" x2="20" y1="12" y2="12" /></>);

export const Heading1Icon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" /><path d="m17 12 3-2v8" /></>);

export const Heading2Icon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" /><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" /></>);

export const Heading3Icon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M4 12h8" /><path d="M4 18V6" /><path d="M12 18V6" /><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2" /><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2" /></>);

export const ListIcon = (props: IconProps = {}) =>
  svgBase(props, <><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></>);

export const ListOrderedIcon = (props: IconProps = {}) =>
  svgBase(props, <><line x1="10" x2="21" y1="6" y2="6" /><line x1="10" x2="21" y1="12" y2="12" /><line x1="10" x2="21" y1="18" y2="18" /><path d="M4 6h1v4" /><path d="M4 10h2" /><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" /></>);

export const CheckSquareIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>);

export const CodeIcon = (props: IconProps = {}) =>
  svgBase(props, <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>);

export const BracesIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1" /><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" /></>);

export const QuoteIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M17 6H3" /><path d="M21 12H8" /><path d="M21 18H8" /><path d="M3 12v6" /></>);

export const LinkIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>);

export const ImageIcon = (props: IconProps = {}) =>
  svgBase(props, <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>);

export const MinusIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M5 12h14" /></>);

export const TableIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M12 3v18" /><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M3 15h18" /></>);

export const EditIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></>);

export const SplitIcon = (props: IconProps = {}) =>
  svgBase(props, <><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M12 3v18" /></>);

export const EyeIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></>);

export const TypeIcon = (props: IconProps = {}) =>
  svgBase(props, <><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" x2="15" y1="20" y2="20" /><line x1="12" x2="12" y1="4" y2="20" /></>);

export const ALargeSmallIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M21 14h-5" /><path d="M16 16v-3.5a2.5 2.5 0 0 1 5 0V16" /><path d="M4.5 13h6" /><path d="m3 16 4.5-9 4.5 9" /></>);

// Context menu icons
export const FilePlus2Icon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M3 15h6" /><path d="M6 12v6" /></>);

export const XIcon = (props: IconProps = {}) =>
  svgBase(props, <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>);

export const CircleDotIcon = (props: IconProps = {}) =>
  svgBase(props, <><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" /></>);
