"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import bts01 from "../../assets/bts/DSCF0314.jpg";
import bts02 from "../../assets/bts/DSCF0374.jpg";
import bts03 from "../../assets/bts/DSCF2279.jpg";
import bts04 from "../../assets/bts/DSCF2988.jpg";
import bts05 from "../../assets/bts/DSCF4590.jpg";
import bts06 from "../../assets/bts/DSCF6924.jpg";
import bts07 from "../../assets/bts/DSCF8758.jpg";
import bts08 from "../../assets/bts/DSCF9247.jpg";
import bts09 from "../../assets/bts/IMG_1219.jpg";
import bts10 from "../../assets/bts/IMG_1294-Enhanced-NR.jpg";
import bts11 from "../../assets/bts/IMG_3434.jpg";
import bts12 from "../../assets/bts/IMG_3999-2.jpg";
import bts13 from "../../assets/bts/IMG_4036-2.jpg";
import bts14 from "../../assets/bts/IMG_5163.jpg";
import bts15 from "../../assets/bts/IMG_5202.jpg";
import bts16 from "../../assets/bts/IMG_6310.jpg";
import bts17 from "../../assets/bts/IMG_6349.jpg";
import bts18 from "../../assets/bts/IMG_7132.jpg";
import bts19 from "../../assets/bts/IMG_7175.jpg";
import bts20 from "../../assets/bts/IMG_8361-2.jpg";
import bts21 from "../../assets/bts/IMG_8446.jpg";

const btsPhotos = [
  bts01,
  bts02,
  bts03,
  bts04,
  bts05,
  bts06,
  bts07,
  bts08,
  bts09,
  bts10,
  bts11,
  bts12,
  bts13,
  bts14,
  bts15,
  bts16,
  bts17,
  bts18,
  bts19,
  bts20,
  bts21,
];

const TILE_COUNT = 10;

function pickRandomPhotos(photos: typeof btsPhotos, count: number) {
  const shuffled = [...photos];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function HomeBtsSection() {
  const [selectedPhotos, setSelectedPhotos] = useState<typeof btsPhotos>([]);

  useEffect(() => {
    setSelectedPhotos(pickRandomPhotos(btsPhotos, TILE_COUNT));
  }, []);

  const photos = selectedPhotos.length === 0 ? btsPhotos.slice(0, TILE_COUNT) : selectedPhotos;

  return (
    <section className="relative mb-16 bg-zinc-950 py-16" aria-label="BTS photos">
      <div className="w-full">
        <div className="metro-grid">
          {photos.map((photo, index) => (
            <div
              className={`metro-tile metro-tile--${(index % 6) + 1}`}
              key={`${photo.src}-metro-${index}`}
            >
              <Image
                src={photo}
                alt=""
                className="h-full w-full object-cover"
                sizes="(min-width: 1280px) 520px, (min-width: 1024px) 420px, 320px"
                quality={100}
                priority={index < 4}
              />
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .metro-grid {
          display: grid;
          grid-template-columns: repeat(12, minmax(0, 1fr));
          grid-auto-rows: 110px;
          gap: 0;
        }
        .metro-tile {
          overflow: hidden;
        }
        .metro-tile--1 {
          grid-column: span 5;
          grid-row: span 3;
        }
        .metro-tile--2 {
          grid-column: span 3;
          grid-row: span 2;
        }
        .metro-tile--3 {
          grid-column: span 4;
          grid-row: span 2;
        }
        .metro-tile--4 {
          grid-column: span 6;
          grid-row: span 3;
        }
        .metro-tile--5 {
          grid-column: span 3;
          grid-row: span 3;
        }
        .metro-tile--6 {
          grid-column: span 3;
          grid-row: span 2;
        }
        @media (max-width: 1024px) {
          .metro-grid {
            grid-template-columns: repeat(8, minmax(0, 1fr));
            grid-auto-rows: 100px;
          gap: 0;
          }
          .metro-tile--1 {
            grid-column: span 4;
            grid-row: span 3;
          }
          .metro-tile--2 {
            grid-column: span 4;
            grid-row: span 2;
          }
          .metro-tile--3 {
            grid-column: span 4;
            grid-row: span 2;
          }
          .metro-tile--4 {
            grid-column: span 8;
            grid-row: span 3;
          }
          .metro-tile--5 {
            grid-column: span 4;
            grid-row: span 3;
          }
          .metro-tile--6 {
            grid-column: span 4;
            grid-row: span 2;
          }
        }
        @media (max-width: 640px) {
          .metro-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            grid-auto-rows: 90px;
          gap: 0;
          }
          .metro-tile--1,
          .metro-tile--2,
          .metro-tile--3,
          .metro-tile--4,
          .metro-tile--5,
          .metro-tile--6 {
            grid-column: span 4;
            grid-row: span 2;
          }
        }
      `}</style>
    </section>
  );
}
