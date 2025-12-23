## Packages
framer-motion | Smooth animations for cards and modals
recharts | Visualizing GPA trends and credit distribution
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind classes safely

## Notes
The app uses a high-contrast minimalist design: White background, Black text, Green accents.
GPA Calculation logic:
A+ = 4.0
A = 4.0
A- = 3.7
B+ = 3.3 (BiTS scale often varies, sticking to standard 4.0 scale approximations or specific BiTS one if provided: A+=4.0, A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, C-=1.7, D=1.0, F=0)
Refined Scale from prompt context: A+=4.0, A=4.0, A-=3.7, B+=3.5, B=3.0, B-=2.7, C+=2.5, C=2.0
