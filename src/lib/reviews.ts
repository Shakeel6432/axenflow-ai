export type ClientReview = {
  id: string;
  name: string;
  country: string;
  text: string;
  rating: 5;
  avatar?: string;
  repeat?: boolean;
};

/** Curated 5-star client reviews (public Fiverr feedback). */
export const clientReviews: ClientReview[] = [
  {
    id: "nbakioui-1",
    name: "nbakioui",
    country: "Morocco",
    text: "I've lost count of the orders I've placed, I rely on your work so much; it's among my best experiences on Fiverr.",
    rating: 5,
    avatar:
      "https://fiverr-res.cloudinary.com/image/upload/f_auto,q_auto,t_profile_small/v1/attachments/profile/photo/5ef08064de59ea1e5bf5d7a694d2688d-1730295176597/c1f835bd-3cc5-4fb1-9f0e-a0afba73dda9.jpg",
    repeat: true,
  },
  {
    id: "allisonevenstar",
    name: "allisonevenstar",
    country: "United States",
    text: "Easy to work with and professional. Was willing to do revisions when necessary.",
    rating: 5,
  },
  {
    id: "naina_agarwall",
    name: "naina_agarwall",
    country: "India",
    text: "Good work, completely met the expectations in one go, no revisions were required.",
    rating: 5,
  },
  {
    id: "rrandjm",
    name: "rrandjm",
    country: "United States",
    text: "THANK YOU SOOO MUCH! I look forward to continuing to work with you and your team!",
    rating: 5,
  },
  {
    id: "alainonesti",
    name: "alainonesti",
    country: "United States",
    text: "Best photon developer I worked so far. He understand clearly and delivers quickly.",
    rating: 5,
    avatar:
      "https://fiverr-res.cloudinary.com/image/upload/f_auto,q_auto,t_profile_small/v1/attachments/profile/photo/b68d1da5cd30922fd124a2d7191dc0aa-813259351781266536.925199/62ED0AFA-A8A8-4410-BBA8-CD439D3A9499",
    repeat: true,
  },
  {
    id: "shawnhanna-1",
    name: "shawnhanna",
    country: "United States",
    text: "Tough scraping job done quickly and professionally. I'll definitely return for more work.",
    rating: 5,
    repeat: true,
  },
  {
    id: "shawnhanna-2",
    name: "shawnhanna",
    country: "United States",
    text: "Great attention to detail and pulled off some challenging data collection for me. Really appreciate the help and working back and forth to get it just right.",
    rating: 5,
    repeat: true,
  },
  {
    id: "adamfisher12345",
    name: "adamfisher12345",
    country: "United Kingdom",
    text: "Outstanding. One of the best freelancers I've worked with. From start to finish, the attention to detail was exceptional. Every element was handled with precision.",
    rating: 5,
    repeat: true,
  },
  {
    id: "mohammadalkaree",
    name: "mohammadalkaree",
    country: "Saudi Arabia",
    text: "Excellent seller. Great value. Very polite and cooperative. Highly recommend.",
    rating: 5,
    avatar:
      "https://fiverr-res.cloudinary.com/image/upload/f_auto,q_auto,t_profile_small/v1/attachments/profile/photo/bad2b0b87b3c9acc3c292d7d1ad6dd81-1571478577915/cc704d17-e839-4307-b707-b524d51b4ad4.png",
    repeat: true,
  },
  {
    id: "mixage51",
    name: "mixage51",
    country: "France",
    text: "High quality work, it includes exactly what I want. Communication is perfect, work extremely fast. I recommend 100%.",
    rating: 5,
    avatar:
      "https://fiverr-res.cloudinary.com/image/upload/f_auto,q_auto,t_profile_small/v1/attachments/profile/photo/a8b82013f8e915704aaa8f276c2eefb0-929475941649104503.649564/AFFFB56E-DEE6-4D1B-BA71-41EB4A4AA037",
    repeat: true,
  },
  {
    id: "mehedihasan4987",
    name: "mehedihasan4987",
    country: "Bangladesh",
    text: "I will hire him again and again. I am fully satisfied with this seller. I recommend him to all buyers.",
    rating: 5,
    avatar:
      "https://fiverr-res.cloudinary.com/image/upload/f_auto,q_auto,t_profile_small/v1/attachments/profile/photo/8c1a459e2215d2800ff8959080a091d0-1690240895858/eace419b-e3af-4570-9175-faa4f6112eff.jpg",
    repeat: true,
  },
  {
    id: "alexeipolozov",
    name: "alexeipolozov",
    country: "Canada",
    text: "He's simply the best!",
    rating: 5,
    avatar:
      "https://fiverr-res.cloudinary.com/image/upload/f_auto,q_auto,t_profile_small/v1/profile/photos/94771/original/n100000064932900_2825.jpg",
  },
  {
    id: "robertgravel",
    name: "robertgravel",
    country: "United States",
    text: "The project was done quickly and exceeded my desires.",
    rating: 5,
    repeat: true,
  },
  {
    id: "leocaju",
    name: "leocaju",
    country: "Hungary",
    text: "Great work. Thank you very much!",
    rating: 5,
    avatar:
      "https://fiverr-res.cloudinary.com/image/upload/f_auto,q_auto,t_profile_small/v1/attachments/profile/photo/e301abcd4055098804416ed904183a81-1575552957828/359667ee-1074-4332-b619-661c20bbe337.jpg",
  },
  {
    id: "vid_business",
    name: "vid_business",
    country: "Germany",
    text: "Very good work, professional service. Great quality and fast delivery, just like how I expected.",
    rating: 5,
    repeat: true,
  },
  {
    id: "apremierdj",
    name: "apremierdj",
    country: "United States",
    text: "Seller went above and beyond to make sure everything I needed was 100%. Even made adjustments as needed. Thank you!",
    rating: 5,
    avatar:
      "https://fiverr-res.cloudinary.com/image/upload/f_auto,q_auto,t_profile_small/v1/attachments/profile/photo/a3ffa143b5efd3f6c50bfe5432be8f98-1764040775448/5910457b-65a2-4b2a-ae85-cf04a4c85c86.jpg",
  },
  {
    id: "andyjbwall",
    name: "andyjbwall",
    country: "Australia",
    text: "Another excellent project, data scraping, very fast, excellent accuracy. Thank you!",
    rating: 5,
    repeat: true,
  },
  {
    id: "user87612447",
    name: "user87612447",
    country: "India",
    text: "I spoke to many freelancers for my project, but no one was able to understand what I needed. He immediately understood and delivered even before the deadline. Highly recommend!",
    rating: 5,
  },
  {
    id: "crealty12",
    name: "crealty12",
    country: "United States",
    text: "Muhammad is the absolute best! Kind, patient, and extremely detail oriented. He went above and beyond on a complex project. Forever my go-to data scraper.",
    rating: 5,
    repeat: true,
  },
  {
    id: "nbakioui-2",
    name: "nbakioui",
    country: "Morocco",
    text: "Always very satisfied with the work, efficiency and performance. I recommend them.",
    rating: 5,
    avatar:
      "https://fiverr-res.cloudinary.com/image/upload/f_auto,q_auto,t_profile_small/v1/attachments/profile/photo/5ef08064de59ea1e5bf5d7a694d2688d-1730295176597/c1f835bd-3cc5-4fb1-9f0e-a0afba73dda9.jpg",
    repeat: true,
  },
];
