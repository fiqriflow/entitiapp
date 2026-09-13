export type AdminNavChild = {
  href: string;
  label: string;
  icon: string;
};

export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  children?: AdminNavChild[];
};
