// Pre-bundled curated playlists for AGOMONI
// Ensures all 111 songs are available instantly offline and in application

export interface CuratedTrack {
  id: string;
  title: string;
  artist: string;
  category: 'PUJA_SONGS' | 'AGOMONI' | 'MAHALAYA' | 'DHAK' | 'AMBIENT';
  provider: 'YOUTUBE_EMBED' | 'SPOTIFY_EMBED' | 'ORIGINAL';
  embedUrl: string;
  artworkUrl: string;
  durationSeconds: number;
  orderIndex: number;
}

export interface CuratedPlaylist {
  id: string;
  name: string;
  nameBengali?: string;
  description?: string;
  coverImage?: string;
  tracks: CuratedTrack[];
}

export const CURATED_PLAYLISTS: CuratedPlaylist[] = [
  {
    "name": "Grand Durga Puja Hits & Anthems",
    "nameBengali": "পূজোর সেরা গান ও উৎসবের সুর",
    "description": "Top festive chartbusters, dance numbers and Puja anthems to celebrate Durga Puja with full energy.",
    "coverImage": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    "tracks": [
      {
        "title": "Dugga Elo (Official Festive Anthem)",
        "artist": "Monali Thakur & Guddu",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/xlElO06nQy8",
        "artworkUrl": "https://img.youtube.com/vi/xlElO06nQy8/hqdefault.jpg",
        "durationSeconds": 151,
        "orderIndex": 1,
        "id": "track-1-1-xlElO06nQy8"
      },
      {
        "title": "Bolo Dugga Elo (বলো দুগ্গা এলো)",
        "artist": "Sunidhi Chauhan & Kaushik-Guddu",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/PiMa4BW9Vrw",
        "artworkUrl": "https://img.youtube.com/vi/PiMa4BW9Vrw/hqdefault.jpg",
        "durationSeconds": 151,
        "orderIndex": 2,
        "id": "track-1-2-PiMa4BW9Vrw"
      },
      {
        "title": "Dugga Elo (দুগ্গা এল)",
        "artist": "Akriti Kakar & Priyanka Sarkar",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/xytF80lvSV8",
        "artworkUrl": "https://img.youtube.com/vi/xytF80lvSV8/hqdefault.jpg",
        "durationSeconds": 151,
        "orderIndex": 3,
        "id": "track-1-3-xytF80lvSV8"
      },
      {
        "title": "Dugga Ma (দুগ্গা মা - Bolo Dugga Maiki)",
        "artist": "Arijit Singh & Arindom",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/sPuZ0Q3KDWo",
        "artworkUrl": "https://img.youtube.com/vi/sPuZ0Q3KDWo/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 4,
        "id": "track-1-4-sPuZ0Q3KDWo"
      },
      {
        "title": "Elo Re Dugga Elo Re",
        "artist": "Raj Barman",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/6YCfoWniGvg",
        "artworkUrl": "https://img.youtube.com/vi/6YCfoWniGvg/hqdefault.jpg",
        "durationSeconds": 151,
        "orderIndex": 5,
        "id": "track-1-5-6YCfoWniGvg"
      },
      {
        "title": "Dugga Maiki Joy (দুগ্গা মাইকী জয়)",
        "artist": "Shree Pritam & Jolly Das",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/80OX5xMvJP4",
        "artworkUrl": "https://img.youtube.com/vi/80OX5xMvJP4/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 6,
        "id": "track-1-6-80OX5xMvJP4"
      },
      {
        "title": "Ebar Jeno Onno Rokom Pujo (Video)",
        "artist": "Dev & Mimi Chakraborty",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/E2zfQEo7Q_M",
        "artworkUrl": "https://img.youtube.com/vi/E2zfQEo7Q_M/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 7,
        "id": "track-1-7-E2zfQEo7Q_M"
      },
      {
        "title": "Elo Je Maa (এলো যে মা)",
        "artist": "Abhijeet Bhattacharya & Shreya Ghoshal",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/NAUA2LM9hZc",
        "artworkUrl": "https://img.youtube.com/vi/NAUA2LM9hZc/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 8,
        "id": "track-1-8-NAUA2LM9hZc"
      },
      {
        "title": "Shundori Komola (সুন্দরী কমলা)",
        "artist": "Armaan Malik & Antara Mitra",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/E_6K3no0PD0",
        "artworkUrl": "https://img.youtube.com/vi/E_6K3no0PD0/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 9,
        "id": "track-1-9-E_6K3no0PD0"
      },
      {
        "title": "Bochor Bochor Aste Hobe Tomay Durga Maa",
        "artist": "Akassh & Haimanti",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/Ez44dZdXDRk",
        "artworkUrl": "https://img.youtube.com/vi/Ez44dZdXDRk/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 10,
        "id": "track-1-10-Ez44dZdXDRk"
      },
      {
        "title": "Joy Joy Durga Maa - The Pujo Song",
        "artist": "Jeet Gannguli (Captain Steel Festive)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/3E_qefwPA0E",
        "artworkUrl": "https://img.youtube.com/vi/3E_qefwPA0E/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 11,
        "id": "track-1-11-3E_qefwPA0E"
      },
      {
        "title": "Bhutu Bhaijaan (ভুতু ভাইজান)",
        "artist": "Shreyan B & Arindom (HAAMI)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/WSy0-WRc_34",
        "artworkUrl": "https://img.youtube.com/vi/WSy0-WRc_34/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 12,
        "id": "track-1-12-WSy0-WRc_34"
      },
      {
        "title": "Komola (কমলা)",
        "artist": "Ankita Bhattacharyya",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/5f1O74GwWJM",
        "artworkUrl": "https://img.youtube.com/vi/5f1O74GwWJM/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 13,
        "id": "track-1-13-5f1O74GwWJM"
      },
      {
        "title": "Tapa Tini (টাপা টিনি)",
        "artist": "Anindya Chatterjee & Monami (Belashuru)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/gQAze-TW23c",
        "artworkUrl": "https://img.youtube.com/vi/gQAze-TW23c/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 14,
        "id": "track-1-14-gQAze-TW23c"
      },
      {
        "title": "Melar Gaan (মেলার গান)",
        "artist": "Anirban, Subhadeep & Debraj",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/hmHDqaePFdU",
        "artworkUrl": "https://img.youtube.com/vi/hmHDqaePFdU/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 15,
        "id": "track-1-15-hmHDqaePFdU"
      },
      {
        "title": "Tumi Aashe Paashe (পারবো না আমি ছাড়তে তোকে)",
        "artist": "Arijit Singh & Raj Chakraborty",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/V-FdetrFMzw",
        "artworkUrl": "https://img.youtube.com/vi/V-FdetrFMzw/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 16,
        "id": "track-1-16-V-FdetrFMzw"
      },
      {
        "title": "Dakatiya Banshi (ডাকাতিয়া বাঁশি)",
        "artist": "Bohurupi (Shiboprosad & Koushani)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/wF9oo8dJ5t4",
        "artworkUrl": "https://img.youtube.com/vi/wF9oo8dJ5t4/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 17,
        "id": "track-1-17-wF9oo8dJ5t4"
      },
      {
        "title": "Bala Nacho To Dekhi (বালা নাচো তো দেখি - Sohag Chand)",
        "artist": "Iman Chakraborty",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/1kgHdX3E_30",
        "artworkUrl": "https://img.youtube.com/vi/1kgHdX3E_30/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 18,
        "id": "track-1-18-1kgHdX3E_30"
      },
      {
        "title": "Fagunero Mohonaye 2.0 (ফাগুনের মোহনায়)",
        "artist": "Nandy Sisters (Antara & Ankita Nandy)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/47BOJY1sheQ",
        "artworkUrl": "https://img.youtube.com/vi/47BOJY1sheQ/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 19,
        "id": "track-1-19-47BOJY1sheQ"
      },
      {
        "title": "Fagunero Mohonay (Traditional Folk Dance)",
        "artist": "Ridy Sheikh Folk Ensemble",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/1cGdw8AzVnM",
        "artworkUrl": "https://img.youtube.com/vi/1cGdw8AzVnM/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 20,
        "id": "track-1-20-1cGdw8AzVnM"
      },
      {
        "title": "Haye Re Biye (হায়রে বিয়ে - Khadaan)",
        "artist": "Abhijeet Bhattacharya & Dev",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/3QYzocDw-2E",
        "artworkUrl": "https://img.youtube.com/vi/3QYzocDw-2E/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 21,
        "id": "track-1-21-3QYzocDw-2E"
      },
      {
        "title": "Rangabati (রঙ্গবতী)",
        "artist": "Iman Chakraborty & Surojit Chatterjee",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/A_PUnDNxFaE",
        "artworkUrl": "https://img.youtube.com/vi/A_PUnDNxFaE/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 22,
        "id": "track-1-22-A_PUnDNxFaE"
      },
      {
        "title": "Kishori (কিশোরী - Khadaan)",
        "artist": "Antara Mitra & Rathijit Bhattacharjee",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/hjBMTHOj00M",
        "artworkUrl": "https://img.youtube.com/vi/hjBMTHOj00M/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 23,
        "id": "track-1-23-hjBMTHOj00M"
      },
      {
        "title": "Dhak Baja Kashor Baja",
        "artist": "Shreya Ghoshal & Jeet Gannguli",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/id5_3dKvEBg",
        "artworkUrl": "https://img.youtube.com/vi/id5_3dKvEBg/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 24,
        "id": "track-1-24-id5_3dKvEBg"
      },
      {
        "title": "Dhaker Taley (ঢাকের তালে)",
        "artist": "Abhijeet Bhattacharya (Poran Jai Jolia Re)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/z4Vc5wHoLiY",
        "artworkUrl": "https://img.youtube.com/vi/z4Vc5wHoLiY/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 25,
        "id": "track-1-25-z4Vc5wHoLiY"
      },
      {
        "title": "Dhitang Dhitang (ধিতাং ধিতাং)",
        "artist": "Armaan Malik & Jeet Gannguli",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/j87D8QMNe5k",
        "artworkUrl": "https://img.youtube.com/vi/j87D8QMNe5k/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 26,
        "id": "track-1-26-j87D8QMNe5k"
      },
      {
        "title": "Bhalobashar Morshum (ভালবাসার মরশুম)",
        "artist": "Shreya Ghoshal & Arijit Singh (X=Prem)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/7NLfpsNHmZI",
        "artworkUrl": "https://img.youtube.com/vi/7NLfpsNHmZI/hqdefault.jpg",
        "durationSeconds": 258,
        "orderIndex": 27,
        "id": "track-1-27-7NLfpsNHmZI"
      },
      {
        "title": "Tor Ek Kothaye (তোর এক কথায়)",
        "artist": "Arijit Singh & Jeet Gannguli (Besh Korechi Prem Korechi)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/AbluPg_E14k",
        "artworkUrl": "https://img.youtube.com/vi/AbluPg_E14k/hqdefault.jpg",
        "durationSeconds": 276,
        "orderIndex": 28,
        "id": "track-1-28-AbluPg_E14k"
      },
      {
        "title": "Patar Bashori (পাতার বাঁশরী)",
        "artist": "Ishaan & Sunidhi Chauhan (Coke Studio Bangla)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/YxJjFjP0crs",
        "artworkUrl": "https://img.youtube.com/vi/YxJjFjP0crs/hqdefault.jpg",
        "durationSeconds": 234,
        "orderIndex": 29,
        "id": "track-1-29-YxJjFjP0crs"
      },
      {
        "title": "Long Distance Love",
        "artist": "Ankan & Afrin (Coke Studio Bangla)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/sqJ2QhjBQaw",
        "artworkUrl": "https://img.youtube.com/vi/sqJ2QhjBQaw/hqdefault.jpg",
        "durationSeconds": 285,
        "orderIndex": 30,
        "id": "track-1-30-sqJ2QhjBQaw"
      },
      {
        "title": "Bulbuli (বুলবুলি)",
        "artist": "Ritu Raj & Nandita (Coke Studio Bangla)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/9c1NIrAqXe4",
        "artworkUrl": "https://img.youtube.com/vi/9c1NIrAqXe4/hqdefault.jpg",
        "durationSeconds": 347,
        "orderIndex": 31,
        "id": "track-1-31-9c1NIrAqXe4"
      },
      {
        "title": "Tapur Tupur (টাপুর টুপুর)",
        "artist": "Arnab Dutta (Rosogolla)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/LTsxOzNdbRQ",
        "artworkUrl": "https://img.youtube.com/vi/LTsxOzNdbRQ/hqdefault.jpg",
        "durationSeconds": 203,
        "orderIndex": 32,
        "id": "track-1-32-LTsxOzNdbRQ"
      },
      {
        "title": "Ki Mayay (কি মায়ায়)",
        "artist": "Shreya Ghoshal & Anupam Roy (Belashuru)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/MtmkCccaA-g",
        "artworkUrl": "https://img.youtube.com/vi/MtmkCccaA-g/hqdefault.jpg",
        "durationSeconds": 161,
        "orderIndex": 33,
        "id": "track-1-33-MtmkCccaA-g"
      },
      {
        "title": "Shimul Polash (শিমুল পলাশ)",
        "artist": "Shrestha Das & Bonnie Chakraborty (Bohurupi)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/kvWvyJGNiMA",
        "artworkUrl": "https://img.youtube.com/vi/kvWvyJGNiMA/hqdefault.jpg",
        "durationSeconds": 209,
        "orderIndex": 34,
        "id": "track-1-34-kvWvyJGNiMA"
      },
      {
        "title": "Deewana Banaisen (দিওয়ানা বানাইসেন)",
        "artist": "Ankush, Koushani & Bonnie (Raktabeej)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/8Qg_tCzmA_w",
        "artworkUrl": "https://img.youtube.com/vi/8Qg_tCzmA_w/hqdefault.jpg",
        "durationSeconds": 172,
        "orderIndex": 35,
        "id": "track-1-35-8Qg_tCzmA_w"
      },
      {
        "title": "Hey Naropishach (হে নরপিশাচ)",
        "artist": "Monali Thakur & Jeet Gannguli (Arundhati)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/XZdQw8gTpAk",
        "artworkUrl": "https://img.youtube.com/vi/XZdQw8gTpAk/hqdefault.jpg",
        "durationSeconds": 198,
        "orderIndex": 36,
        "id": "track-1-36-XZdQw8gTpAk"
      },
      {
        "title": "Haat Dhoreche Gaacher Paata (হাত ধরেছে গাছের পাতা)",
        "artist": "Shreya Ghoshal (Antaheen)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/NNbMJW4_wQc",
        "artworkUrl": "https://img.youtube.com/vi/NNbMJW4_wQc/hqdefault.jpg",
        "durationSeconds": 244,
        "orderIndex": 37,
        "id": "track-1-37-NNbMJW4_wQc"
      },
      {
        "title": "Jhilmil Laage Re (ঝিলমিল লাগে রে)",
        "artist": "Nilayan, Ishan & Shuchismita (Raghu Dakat)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/VHJVP3OQHzI",
        "artworkUrl": "https://img.youtube.com/vi/VHJVP3OQHzI/hqdefault.jpg",
        "durationSeconds": 224,
        "orderIndex": 38,
        "id": "track-1-38-VHJVP3OQHzI"
      },
      {
        "title": "Mon Bojhe Naa (মন বোঝে না)",
        "artist": "Arijit Singh (Chirodini Tumi Je Amar 2)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/6SkQ-srIJVM",
        "artworkUrl": "https://img.youtube.com/vi/6SkQ-srIJVM/hqdefault.jpg",
        "durationSeconds": 226,
        "orderIndex": 39,
        "id": "track-1-39-6SkQ-srIJVM"
      },
      {
        "title": "Neel Digante (নীল দিগন্তে)",
        "artist": "Shreya Ghoshal (Gotro)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/Y1doS51Ec4I",
        "artworkUrl": "https://img.youtube.com/vi/Y1doS51Ec4I/hqdefault.jpg",
        "durationSeconds": 243,
        "orderIndex": 40,
        "id": "track-1-40-Y1doS51Ec4I"
      },
      {
        "title": "Bodhua (বধুয়া)",
        "artist": "Zubeen Garg & Alka Yagnik (Dujone)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/VGHPIVS_d1k",
        "artworkUrl": "https://img.youtube.com/vi/VGHPIVS_d1k/hqdefault.jpg",
        "durationSeconds": 265,
        "orderIndex": 41,
        "id": "track-1-41-VGHPIVS_d1k"
      },
      {
        "title": "Radha (রাধা)",
        "artist": "Iman Chakraborty & Shovan Ganguly (ASUR)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/2-XRAqiMRQM",
        "artworkUrl": "https://img.youtube.com/vi/2-XRAqiMRQM/hqdefault.jpg",
        "durationSeconds": 183,
        "orderIndex": 42,
        "id": "track-1-42-2-XRAqiMRQM"
      },
      {
        "title": "Jabo Na Jabo Na Phire (যাবো না যাবো না ফিরে)",
        "artist": "Arijit Singh (Reprise Version)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/E-j6P00oht0",
        "artworkUrl": "https://img.youtube.com/vi/E-j6P00oht0/hqdefault.jpg",
        "durationSeconds": 199,
        "orderIndex": 43,
        "id": "track-1-43-E-j6P00oht0"
      },
      {
        "title": "Akasheo Alpo Neel (আকাশেও অল্প নীল)",
        "artist": "Arijit Singh & Indraadip Dasgupta (Kabir)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/O7CISHZ4AX8",
        "artworkUrl": "https://img.youtube.com/vi/O7CISHZ4AX8/hqdefault.jpg",
        "durationSeconds": 258,
        "orderIndex": 44,
        "id": "track-1-44-O7CISHZ4AX8"
      },
      {
        "title": "Sharatadin (সারাদিন)",
        "artist": "Arijit Singh & Anwesshaa (Yoddha)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/DbXP1TqLwrs",
        "artworkUrl": "https://img.youtube.com/vi/DbXP1TqLwrs/hqdefault.jpg",
        "durationSeconds": 310,
        "orderIndex": 45,
        "id": "track-1-45-DbXP1TqLwrs"
      },
      {
        "title": "Gaane Gaane (গানে গানে)",
        "artist": "Arijit Singh & Shreya Ghoshal (Dhumketu)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/woIv0NroLRI",
        "artworkUrl": "https://img.youtube.com/vi/woIv0NroLRI/hqdefault.jpg",
        "durationSeconds": 300,
        "orderIndex": 46,
        "id": "track-1-46-woIv0NroLRI"
      },
      {
        "title": "E Tumi Kemon Tumi (এ তুমি কেমন তুমি)",
        "artist": "Rupankar Bagchi & Kabir Suman (Jaatishwar)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/B_ucVJpcHVc",
        "artworkUrl": "https://img.youtube.com/vi/B_ucVJpcHVc/hqdefault.jpg",
        "durationSeconds": 184,
        "orderIndex": 47,
        "id": "track-1-47-B_ucVJpcHVc"
      },
      {
        "title": "Naam Na Jana Pakhi (নাম না জানা পাখি)",
        "artist": "Arijit Singh & Shreya Ghoshal (Ka Kha Ga Gha)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/JiV8MLQjJsw",
        "artworkUrl": "https://img.youtube.com/vi/JiV8MLQjJsw/hqdefault.jpg",
        "durationSeconds": 258,
        "orderIndex": 48,
        "id": "track-1-48-JiV8MLQjJsw"
      },
      {
        "title": "Kothin (কঠিন)",
        "artist": "Ash King & Sayani Ghosh (Bojhena Shey Bojhena)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/fhJViO9WyLw",
        "artworkUrl": "https://img.youtube.com/vi/fhJViO9WyLw/hqdefault.jpg",
        "durationSeconds": 298,
        "orderIndex": 49,
        "id": "track-1-49-fhJViO9WyLw"
      },
      {
        "title": "Sajna (সজনা)",
        "artist": "Prashmita Paul & Arindom (Bojhena Shey Bojhena)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/2pOFhl9J544",
        "artworkUrl": "https://img.youtube.com/vi/2pOFhl9J544/hqdefault.jpg",
        "durationSeconds": 332,
        "orderIndex": 50,
        "id": "track-1-50-2pOFhl9J544"
      },
      {
        "title": "Man Bawre (মন বাওরে)",
        "artist": "Arijit Singh (Kanamachi)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/tizLNHAkOBY",
        "artworkUrl": "https://img.youtube.com/vi/tizLNHAkOBY/hqdefault.jpg",
        "durationSeconds": 266,
        "orderIndex": 51,
        "id": "track-1-51-tizLNHAkOBY"
      },
      {
        "title": "Katakuti Khela (কাটাকুটি খেলা)",
        "artist": "Shaan & Shreya Ghoshal (Zulfiqar)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/gSRSBHpAye8",
        "artworkUrl": "https://img.youtube.com/vi/gSRSBHpAye8/hqdefault.jpg",
        "durationSeconds": 198,
        "orderIndex": 52,
        "id": "track-1-52-gSRSBHpAye8"
      },
      {
        "title": "Ei Bhalo Ei Kharap (এই ভালো এই খারাপ)",
        "artist": "Arijit Singh & Monali Thakur (Golpo Holeo Shotti)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/U2xrwSBJjGM",
        "artworkUrl": "https://img.youtube.com/vi/U2xrwSBJjGM/hqdefault.jpg",
        "durationSeconds": 184,
        "orderIndex": 53,
        "id": "track-1-53-U2xrwSBJjGM"
      },
      {
        "title": "Ajke Ei Khushir Dine (আজকে এই খুশির দিনে)",
        "artist": "Dev, Chiranjeet & Srabanti (Bindaas)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/HgQNYqD31jo",
        "artworkUrl": "https://img.youtube.com/vi/HgQNYqD31jo/hqdefault.jpg",
        "durationSeconds": 167,
        "orderIndex": 54,
        "id": "track-1-54-HgQNYqD31jo"
      },
      {
        "title": "Awaara Dil (আওয়ারা দিল)",
        "artist": "Dev Sen & Prasenjit (Ki Kore Toke Bolbo)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/UALbaUwK9zo",
        "artworkUrl": "https://img.youtube.com/vi/UALbaUwK9zo/hqdefault.jpg",
        "durationSeconds": 165,
        "orderIndex": 55,
        "id": "track-1-55-UALbaUwK9zo"
      },
      {
        "title": "Subha Mangalam (শুভ মঙ্গলম)",
        "artist": "Zubeen Garg & Jeet Gannguli (Mon Mane Na)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/1lrfeNL4ZbI",
        "artworkUrl": "https://img.youtube.com/vi/1lrfeNL4ZbI/hqdefault.jpg",
        "durationSeconds": 240,
        "orderIndex": 56,
        "id": "track-1-56-1lrfeNL4ZbI"
      },
      {
        "title": "Jay Govinda Jay Gopala (জয় গোবিন্দ জয় গোপাল)",
        "artist": "Abhijeet Bhattacharya & Mahalaxmi Iyer (Khoka 420)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/T1_UO94Wamg",
        "artworkUrl": "https://img.youtube.com/vi/T1_UO94Wamg/hqdefault.jpg",
        "durationSeconds": 245,
        "orderIndex": 57,
        "id": "track-1-57-T1_UO94Wamg"
      },
      {
        "title": "Cholre Cholre Bhai (চলরে চলরে ভাই)",
        "artist": "Sonu Nigam & Jeet Gannguli (Dui Prithibi)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/zhk1HZ7EJr4",
        "artworkUrl": "https://img.youtube.com/vi/zhk1HZ7EJr4/hqdefault.jpg",
        "durationSeconds": 359,
        "orderIndex": 58,
        "id": "track-1-58-zhk1HZ7EJr4"
      },
      {
        "title": "Kichu Hashi Kichu Asha (কিছু হাসি কিছু আশা)",
        "artist": "Sonu Nigam & Jeet Gannguli (Bandhan)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/SiJdQFfsdCY",
        "artworkUrl": "https://img.youtube.com/vi/SiJdQFfsdCY/hqdefault.jpg",
        "durationSeconds": 338,
        "orderIndex": 59,
        "id": "track-1-59-SiJdQFfsdCY"
      },
      {
        "title": "Na Re Na (না রে না)",
        "artist": "Arijit Singh & Arindom (Bojhena Shey Bojhena)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/azLiK9wdxl8",
        "artworkUrl": "https://img.youtube.com/vi/azLiK9wdxl8/hqdefault.jpg",
        "durationSeconds": 264,
        "orderIndex": 60,
        "id": "track-1-60-azLiK9wdxl8"
      },
      {
        "title": "Shongshar Sukher Hoi (সংসার সুখের হয়)",
        "artist": "Babul Supriyo & Shreya Ghoshal (Premer Kahini)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/LQhFmxSihzo",
        "artworkUrl": "https://img.youtube.com/vi/LQhFmxSihzo/hqdefault.jpg",
        "durationSeconds": 293,
        "orderIndex": 61,
        "id": "track-1-61-LQhFmxSihzo"
      },
      {
        "title": "Aamar Mon (আমার মন)",
        "artist": "Savvy & Md. Irfan (Sultan - The Saviour)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/A6NwRYq9sTM",
        "artworkUrl": "https://img.youtube.com/vi/A6NwRYq9sTM/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 62,
        "id": "track-1-62-A6NwRYq9sTM"
      },
      {
        "title": "Bol Naa Aar (বল না আর)",
        "artist": "Shaan & Monali Thakur (Dui Prithibi)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/66o3OsfVDiI",
        "artworkUrl": "https://img.youtube.com/vi/66o3OsfVDiI/hqdefault.jpg",
        "durationSeconds": 240,
        "orderIndex": 63,
        "id": "track-1-63-66o3OsfVDiI"
      },
      {
        "title": "Moner Kinare (মনের কিনারে)",
        "artist": "Raj Barman & Savvy (Inspector NottyK)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/7cTTSkwk1kc",
        "artworkUrl": "https://img.youtube.com/vi/7cTTSkwk1kc/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 64,
        "id": "track-1-64-7cTTSkwk1kc"
      },
      {
        "title": "Porle Mone (পড়লে মনে)",
        "artist": "Jeet Gannguli (Awara)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/2NgDugvUjZs",
        "artworkUrl": "https://img.youtube.com/vi/2NgDugvUjZs/hqdefault.jpg",
        "durationSeconds": 240,
        "orderIndex": 65,
        "id": "track-1-65-2NgDugvUjZs"
      },
      {
        "title": "Shey Chilo Boroi Anmona (সে ছিল বড়ই আনমনা)",
        "artist": "Shaan & Sweta (Bandhan)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/-dauLSmMPBg",
        "artworkUrl": "https://img.youtube.com/vi/-dauLSmMPBg/hqdefault.jpg",
        "durationSeconds": 230,
        "orderIndex": 66,
        "id": "track-1-66--dauLSmMPBg"
      },
      {
        "title": "Ei Neel Sagarer Pare (এই নীল সাগরের পাড়ে)",
        "artist": "Shaan & Jeet Gannguli (Ghatak)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/uDumrcpCZDE",
        "artworkUrl": "https://img.youtube.com/vi/uDumrcpCZDE/hqdefault.jpg",
        "durationSeconds": 220,
        "orderIndex": 67,
        "id": "track-1-67-uDumrcpCZDE"
      },
      {
        "title": "Maa Esheche (মা এসেছে)",
        "artist": "Kumar Sanu & Jeet Gannguli (Projapati 2)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/08RR4i24fBQ",
        "artworkUrl": "https://img.youtube.com/vi/08RR4i24fBQ/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 68,
        "id": "track-1-68-08RR4i24fBQ"
      },
      {
        "title": "Bum Chiki Chikni Chiki (বুম চিকি চিকনি চিকি)",
        "artist": "Jeet & Subhashree (GAME)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/1koSBje19Es",
        "artworkUrl": "https://img.youtube.com/vi/1koSBje19Es/hqdefault.jpg",
        "durationSeconds": 200,
        "orderIndex": 69,
        "id": "track-1-69-1koSBje19Es"
      },
      {
        "title": "Oi Tor Mayabi Chokh (ওই তোর মায়াবী চোখ)",
        "artist": "Shreya Ghoshal & Jeet Gannguli (Besh Korechi Prem Korechi)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/Jry9XwKIplk",
        "artworkUrl": "https://img.youtube.com/vi/Jry9XwKIplk/hqdefault.jpg",
        "durationSeconds": 220,
        "orderIndex": 70,
        "id": "track-1-70-Jry9XwKIplk"
      },
      {
        "title": "Eeche Joto (ইচ্ছে যত)",
        "artist": "Arijit Singh & Monali Thakur (BOSS)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/G3wcY_DVZO0",
        "artworkUrl": "https://img.youtube.com/vi/G3wcY_DVZO0/hqdefault.jpg",
        "durationSeconds": 220,
        "orderIndex": 71,
        "id": "track-1-71-G3wcY_DVZO0"
      },
      {
        "title": "Joy Kali (জয় কালী)",
        "artist": "Rathijit, Ishan, Shreya, Sugata (Raghu Dakat)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/xAjleY11ErY",
        "artworkUrl": "https://img.youtube.com/vi/xAjleY11ErY/hqdefault.jpg",
        "durationSeconds": 220,
        "orderIndex": 72,
        "id": "track-1-72-xAjleY11ErY"
      },
      {
        "title": "Phool Phutechhe (ফুল ফুটেছে)",
        "artist": "Bonnie Chakraborty & Arpita (Bohurupi The Golden Daku)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/cUMBTCcqHjE",
        "artworkUrl": "https://img.youtube.com/vi/cUMBTCcqHjE/hqdefault.jpg",
        "durationSeconds": 195,
        "orderIndex": 73,
        "id": "track-1-73-cUMBTCcqHjE"
      },
      {
        "title": "Moydamukho Hit (ময়দামুখো)",
        "artist": "Shrestha Das & Bonnie Chakraborty (Bohurupi The Golden Daku)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/ivsq9AJy7t0",
        "artworkUrl": "https://img.youtube.com/vi/ivsq9AJy7t0/hqdefault.jpg",
        "durationSeconds": 180,
        "orderIndex": 74,
        "id": "track-1-74-ivsq9AJy7t0"
      },
      {
        "title": "Hasli Keno Bol (হাসলি কেন বল)",
        "artist": "Jeet Gannguli, Dev & Idhika (Projapati 2)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/7NsURBp3lMA",
        "artworkUrl": "https://img.youtube.com/vi/7NsURBp3lMA/hqdefault.jpg",
        "durationSeconds": 215,
        "orderIndex": 75,
        "id": "track-1-75-7NsURBp3lMA"
      },
      {
        "title": "Tor Sudhu Tor (তোর শুধু তোর)",
        "artist": "Savvy & Barish (Dev & Subhashree Ganguly - DeSu7)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/21jQazRbvVc",
        "artworkUrl": "https://img.youtube.com/vi/21jQazRbvVc/hqdefault.jpg",
        "durationSeconds": 240,
        "orderIndex": 76,
        "id": "track-1-76-21jQazRbvVc"
      },
      {
        "title": "Prithibita Bhalo Lokeder Noy (পৃথিবীটা ভালো লোকেদের নয়)",
        "artist": "HooliGaanism (Bengali Rock)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/wwVJkE0X4CY",
        "artworkUrl": "https://img.youtube.com/vi/wwVJkE0X4CY/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 77,
        "id": "track-1-77-wwVJkE0X4CY"
      },
      {
        "title": "Tui Kyane Eli Sarobore (তুই ক্যানে এলি সরোবরে)",
        "artist": "Silajit Majumder & Sukanya C (Bohurupi)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/YTqW_lZiEYA",
        "artworkUrl": "https://img.youtube.com/vi/YTqW_lZiEYA/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 78,
        "id": "track-1-78-YTqW_lZiEYA"
      },
      {
        "title": "Dhire Dhire (ধীরে ধীরে)",
        "artist": "Timir Biswas, Arnab Dutta & Raj Barman (Rosogolla)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/7l0Gb0LDP1s",
        "artworkUrl": "https://img.youtube.com/vi/7l0Gb0LDP1s/hqdefault.jpg",
        "durationSeconds": 250,
        "orderIndex": 79,
        "id": "track-1-79-7l0Gb0LDP1s"
      },
      {
        "title": "Joy Joy Maa (জয় জয় মা)",
        "artist": "Kailash Kher & Jeet Gannguli (Arundhati)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/O0ktsguogfc",
        "artworkUrl": "https://img.youtube.com/vi/O0ktsguogfc/hqdefault.jpg",
        "durationSeconds": 235,
        "orderIndex": 80,
        "id": "track-1-80-O0ktsguogfc"
      },
      {
        "title": "Shona (সোনা)",
        "artist": "Nakash Aziz & Antara Mitra (Haripada Bandwala)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/ed6URNZkPgI",
        "artworkUrl": "https://img.youtube.com/vi/ed6URNZkPgI/hqdefault.jpg",
        "durationSeconds": 220,
        "orderIndex": 81,
        "id": "track-1-81-ed6URNZkPgI"
      },
      {
        "title": "Toke Hebbi Lagche (তোকে হেব্বি লাগছে)",
        "artist": "Zubeen Garg (Idiot - Ankush & Srabanti)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/tOLN3ruNFpA",
        "artworkUrl": "https://img.youtube.com/vi/tOLN3ruNFpA/hqdefault.jpg",
        "durationSeconds": 245,
        "orderIndex": 82,
        "id": "track-1-82-tOLN3ruNFpA"
      },
      {
        "title": "Pagli Tore Rakhbo Adore (পাগলী তোরে রাখবো আদরে)",
        "artist": "Zubeen Garg (Idiot - Ankush & Srabanti)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/5SA6QPyTSUU",
        "artworkUrl": "https://img.youtube.com/vi/5SA6QPyTSUU/hqdefault.jpg",
        "durationSeconds": 230,
        "orderIndex": 83,
        "id": "track-1-83-5SA6QPyTSUU"
      },
      {
        "title": "Tor Neshate (তোর নেশাতে)",
        "artist": "Armaan Malik & Jeet Gannguli (Piya Re)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/vvvjxVHwg5E",
        "artworkUrl": "https://img.youtube.com/vi/vvvjxVHwg5E/hqdefault.jpg",
        "durationSeconds": 260,
        "orderIndex": 84,
        "id": "track-1-84-vvvjxVHwg5E"
      },
      {
        "title": "Baap Eseche (বাপ এসেছে)",
        "artist": "Nilayan Chatterjee & Ishan Mitra (Khadaan - Dev)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/tJYBPYb6xg0",
        "artworkUrl": "https://img.youtube.com/vi/tJYBPYb6xg0/hqdefault.jpg",
        "durationSeconds": 225,
        "orderIndex": 85,
        "id": "track-1-85-tJYBPYb6xg0"
      },
      {
        "title": "Batashey Gungun (বাতাসে গুনগুন)",
        "artist": "June Banerjee & Jeet Gannguli (Chirodini Tumi Je Amar)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/5fY7B8Jv1Ss",
        "artworkUrl": "https://img.youtube.com/vi/5fY7B8Jv1Ss/hqdefault.jpg",
        "durationSeconds": 310,
        "orderIndex": 86,
        "id": "track-1-86-5fY7B8Jv1Ss"
      },
      {
        "title": "Uru Uru Swapne Ek Rajkonye (উড়ু উড়ু স্বপ্নে এক রাজকন্যে)",
        "artist": "Kunal Ganjawala & Jeet Gannguli (Prem Amar)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/89KF9qgW3Aw",
        "artworkUrl": "https://img.youtube.com/vi/89KF9qgW3Aw/hqdefault.jpg",
        "durationSeconds": 275,
        "orderIndex": 87,
        "id": "track-1-87-89KF9qgW3Aw"
      },
      {
        "title": "Haye Rama (হায় রামা)",
        "artist": "Sonu Nigam & Jeet Gannguli (Amanush)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/j0a3RLeZdgM",
        "artworkUrl": "https://img.youtube.com/vi/j0a3RLeZdgM/hqdefault.jpg",
        "durationSeconds": 280,
        "orderIndex": 88,
        "id": "track-1-88-j0a3RLeZdgM"
      },
      {
        "title": "Saajna Pass Ay Tu Jara (সজনা পাস আয় তু জরা)",
        "artist": "Zubeen Garg & June Banerjee (Idiot)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/JwnE2lJVBtQ",
        "artworkUrl": "https://img.youtube.com/vi/JwnE2lJVBtQ/hqdefault.jpg",
        "durationSeconds": 240,
        "orderIndex": 89,
        "id": "track-1-89-JwnE2lJVBtQ"
      },
      {
        "title": "Pagol Ami Already (পাগল আমি অলরেডি)",
        "artist": "Zubeen Garg & Mahalaxmi Iyer (Khiladi - Ankush & Nusrat)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/13PSQ31fuaw",
        "artworkUrl": "https://img.youtube.com/vi/13PSQ31fuaw/hqdefault.jpg",
        "durationSeconds": 235,
        "orderIndex": 90,
        "id": "track-1-90-13PSQ31fuaw"
      },
      {
        "title": "Hawara Chupi Chupi (হাওয়ারা চুপি চুপি)",
        "artist": "Shaan & June Banerjee (Bangali Babu English Mem)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/Ga1hJenRwDc",
        "artworkUrl": "https://img.youtube.com/vi/Ga1hJenRwDc/hqdefault.jpg",
        "durationSeconds": 250,
        "orderIndex": 91,
        "id": "track-1-91-Ga1hJenRwDc"
      },
      {
        "title": "Tui Borsha Bikeler Dheu (তুই বর্ষা বিকেলের ঢেউ)",
        "artist": "Shaan, Palak Muchhal & Jeet Gannguli (Rocky)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/bhaS8sOfYIo",
        "artworkUrl": "https://img.youtube.com/vi/bhaS8sOfYIo/hqdefault.jpg",
        "durationSeconds": 270,
        "orderIndex": 92,
        "id": "track-1-92-bhaS8sOfYIo"
      },
      {
        "title": "Bhogoban (ভগবান)",
        "artist": "Somlata Acharyya & Arindom (Bojhena Shey Bojhena)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/HSxY0WYP9A4",
        "artworkUrl": "https://img.youtube.com/vi/HSxY0WYP9A4/hqdefault.jpg",
        "durationSeconds": 265,
        "orderIndex": 93,
        "id": "track-1-93-HSxY0WYP9A4"
      },
      {
        "title": "Khoka Chalu Cheez (খোকা চালু চিজ)",
        "artist": "Savvy & Dev (Khokababu)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/GnDM9FvDz4E",
        "artworkUrl": "https://img.youtube.com/vi/GnDM9FvDz4E/hqdefault.jpg",
        "durationSeconds": 215,
        "orderIndex": 94,
        "id": "track-1-94-GnDM9FvDz4E"
      },
      {
        "title": "Borbaad Hoyechi Ami (বরবাদ হয়েছি আমি)",
        "artist": "Arindom Chatterjee & Prasen (Borbaad)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/8M4-OfFaYSg",
        "artworkUrl": "https://img.youtube.com/vi/8M4-OfFaYSg/hqdefault.jpg",
        "durationSeconds": 270,
        "orderIndex": 95,
        "id": "track-1-95-8M4-OfFaYSg"
      },
      {
        "title": "I Love You (আই লাভ ইউ)",
        "artist": "Shaan, Shreya Ghoshal & Gautam Sushmit (I Love You)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/gAWT1gegiao",
        "artworkUrl": "https://img.youtube.com/vi/gAWT1gegiao/hqdefault.jpg",
        "durationSeconds": 320,
        "orderIndex": 96,
        "id": "track-1-96-gAWT1gegiao"
      },
      {
        "title": "Sonali Roddure (সোনালী রোদ্দুরে)",
        "artist": "Zubeen Garg & Alka Yagnik (Dujone - Dev & Srabanti)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/q-lKDC8CqZE",
        "artworkUrl": "https://img.youtube.com/vi/q-lKDC8CqZE/hqdefault.jpg",
        "durationSeconds": 290,
        "orderIndex": 97,
        "id": "track-1-97-q-lKDC8CqZE"
      },
      {
        "title": "Jege Achi (জেগে আছি)",
        "artist": "Dev Sen, Prasenjit Mallick & Dipanwita (Deewana - Jeet & Srabanti)",
        "category": "PUJA_SONGS",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/hRt5t5md174",
        "artworkUrl": "https://img.youtube.com/vi/hRt5t5md174/hqdefault.jpg",
        "durationSeconds": 260,
        "orderIndex": 98,
        "id": "track-1-98-hRt5t5md174"
      }
    ],
    "id": "playlist-1"
  },
  {
    "name": "Mahalaya & Mahishasura Mardini",
    "nameBengali": "মহালয়া ও মহিষাসুরমর্দিনী",
    "description": "The divine and iconic dawn broadcast of Mahishasura Mardini marking the holy arrival of Maa Durga.",
    "coverImage": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    "tracks": [
      {
        "title": "Mahalaya (Mahishasura Mardini) — Full Album",
        "artist": "Birendra Krishna Bhadra & Pankaj Mullick (All India Radio)",
        "category": "MAHALAYA",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/YQyo8QeoYhc",
        "artworkUrl": "https://img.youtube.com/vi/YQyo8QeoYhc/hqdefault.jpg",
        "durationSeconds": 5358,
        "orderIndex": 1,
        "id": "track-2-1-YQyo8QeoYhc"
      }
    ],
    "id": "playlist-2"
  },
  {
    "name": "Festive Dhak & Beats",
    "nameBengali": "পুজোর ঢাক ও উৎসবের ছন্দ",
    "description": "Authentic traditional Bengali Dhak rhythms and non-stop Dhunuchi Naach beats.",
    "coverImage": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
    "tracks": [
      {
        "title": "Non-Stop Banglar Dhak (ঢাকের বোলে নাচো তালে)",
        "artist": "Traditional Bengali Dhak & Dhunuchi Ensemble",
        "category": "DHAK",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/ZpUOgCsPgy0",
        "artworkUrl": "https://img.youtube.com/vi/ZpUOgCsPgy0/hqdefault.jpg",
        "durationSeconds": 3593,
        "orderIndex": 1,
        "id": "track-3-1-ZpUOgCsPgy0"
      }
    ],
    "id": "playlist-3"
  },
  {
    "name": "Agomoni & Devotional Melodies",
    "nameBengali": "আগমনী ও ভক্তিগীতি",
    "description": "The divine hymns and welcoming melodies celebrating Maa Durga.",
    "coverImage": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    "tracks": [
      {
        "title": "O Thakur (Belaseshe)",
        "artist": "Upal Sengupta & Prashmita Paul",
        "category": "AGOMONI",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/7GYJcXSLwYo",
        "artworkUrl": "https://img.youtube.com/vi/7GYJcXSLwYo/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 1,
        "id": "track-4-1-7GYJcXSLwYo"
      },
      {
        "title": "Aamaar Dugga (আমার দুগ্গা)",
        "artist": "Monali Thakur",
        "category": "AGOMONI",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/4h5DXcN6cd4",
        "artworkUrl": "https://img.youtube.com/vi/4h5DXcN6cd4/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 2,
        "id": "track-4-2-4h5DXcN6cd4"
      },
      {
        "title": "Ailo Uma Barite (আইলো উমা বাড়িতে)",
        "artist": "Monami Ghosh",
        "category": "AGOMONI",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/4zyCkmAS1Oo",
        "artworkUrl": "https://img.youtube.com/vi/4zyCkmAS1Oo/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 3,
        "id": "track-4-3-4zyCkmAS1Oo"
      },
      {
        "title": "Uma Ashe Notun Saje (উমা আসে নতুন সাজে)",
        "artist": "Ankita Bhattacharyya",
        "category": "AGOMONI",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/hnkfDCbULxk",
        "artworkUrl": "https://img.youtube.com/vi/hnkfDCbULxk/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 4,
        "id": "track-4-4-hnkfDCbULxk"
      },
      {
        "title": "Sunrise Dashabhuja (দশভূজা)",
        "artist": "Monali Thakur & Jeet Gannguli",
        "category": "AGOMONI",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/G9DnRI1J2wo",
        "artworkUrl": "https://img.youtube.com/vi/G9DnRI1J2wo/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 5,
        "id": "track-4-5-G9DnRI1J2wo"
      }
    ],
    "id": "playlist-4"
  },
  {
    "name": "Autumn Twilight & Folk Beats",
    "nameBengali": "শরতের সান্ধ্য ও লোকসঙ্গীত",
    "description": "Soothing autumnal tunes, classic Bengali folk songs and acoustic melodies.",
    "coverImage": "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80",
    "tracks": [
      {
        "title": "Pindare Polasher Bon (পিন্দারে পলাশের বন)",
        "artist": "Ankita Bhattacharya (Bengali Folk)",
        "category": "AMBIENT",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/HjqqrcGBqsw",
        "artworkUrl": "https://img.youtube.com/vi/HjqqrcGBqsw/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 1,
        "id": "track-5-1-HjqqrcGBqsw"
      },
      {
        "title": "Boshonto Bohilo (বসন্ত বহিলো)",
        "artist": "Ankita Bhattacharya",
        "category": "AMBIENT",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/3bC2suUlS3w",
        "artworkUrl": "https://img.youtube.com/vi/3bC2suUlS3w/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 2,
        "id": "track-5-2-3bC2suUlS3w"
      },
      {
        "title": "Kalo Jole Kuchla Tole (কালো জলে কুচলা তলে)",
        "artist": "Iman Chakraborty (Bangla Jhumur)",
        "category": "AMBIENT",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/YXG0AW4eidI",
        "artworkUrl": "https://img.youtube.com/vi/YXG0AW4eidI/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 3,
        "id": "track-5-3-YXG0AW4eidI"
      },
      {
        "title": "Khawne Gorachand, Khawne Kaalaa (লহ গৌরাঙ্গের নাম)",
        "artist": "Arijit Singh & Srijit Mukherji",
        "category": "AMBIENT",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/guv_YlxJIHo",
        "artworkUrl": "https://img.youtube.com/vi/guv_YlxJIHo/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 4,
        "id": "track-5-4-guv_YlxJIHo"
      },
      {
        "title": "Barandaye Roddur (বারান্দায় রোদ্দুর - Tomar Dekha Nai)",
        "artist": "Bhoomi Band (Bengali Folk Rock)",
        "category": "AMBIENT",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/BRo3gwIvj60",
        "artworkUrl": "https://img.youtube.com/vi/BRo3gwIvj60/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 5,
        "id": "track-5-5-BRo3gwIvj60"
      },
      {
        "title": "Tomake (তোমাকে - Parineeta)",
        "artist": "Shreya Ghoshal & Arko",
        "category": "AMBIENT",
        "provider": "YOUTUBE_EMBED",
        "embedUrl": "https://www.youtube-nocookie.com/embed/Whr3M4P2RKE",
        "artworkUrl": "https://img.youtube.com/vi/Whr3M4P2RKE/hqdefault.jpg",
        "durationSeconds": 210,
        "orderIndex": 6,
        "id": "track-5-6-Whr3M4P2RKE"
      }
    ],
    "id": "playlist-5"
  }
];

export const ALL_CURATED_TRACKS: CuratedTrack[] = CURATED_PLAYLISTS.flatMap((p) => p.tracks);
