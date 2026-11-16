// Conteúdo importado do app da escola (speakup-school-manager) e corrigido.
// Ainda NÃO está ligado à interface. Lista das correções: ./CORRECTIONS.md

import type { SchoolNumberEntry } from "./types";

export const SCHOOL_NUMBERS: Record<"zeroToTwenty" | "twentyToOneHundred" | "hundredToTwoThousand", SchoolNumberEntry[]> = {
  "zeroToTwenty": [
    {
      "number": "0",
      "word": "zero"
    },
    {
      "number": "1",
      "word": "one"
    },
    {
      "number": "2",
      "word": "two"
    },
    {
      "number": "3",
      "word": "three"
    },
    {
      "number": "4",
      "word": "four"
    },
    {
      "number": "5",
      "word": "five"
    },
    {
      "number": "6",
      "word": "six"
    },
    {
      "number": "7",
      "word": "seven"
    },
    {
      "number": "8",
      "word": "eight"
    },
    {
      "number": "9",
      "word": "nine"
    },
    {
      "number": "10",
      "word": "ten"
    },
    {
      "number": "11",
      "word": "eleven"
    },
    {
      "number": "12",
      "word": "twelve"
    },
    {
      "number": "13",
      "word": "thirteen"
    },
    {
      "number": "14",
      "word": "fourteen"
    },
    {
      "number": "15",
      "word": "fifteen"
    },
    {
      "number": "16",
      "word": "sixteen"
    },
    {
      "number": "17",
      "word": "seventeen"
    },
    {
      "number": "18",
      "word": "eighteen"
    },
    {
      "number": "19",
      "word": "nineteen"
    },
    {
      "number": "20",
      "word": "twenty"
    }
  ],
  "twentyToOneHundred": [
    {
      "number": "20",
      "word": "twenty"
    },
    {
      "number": "21",
      "word": "twenty-one"
    },
    {
      "number": "22",
      "word": "twenty-two"
    },
    {
      "number": "23",
      "word": "twenty-three"
    },
    {
      "number": "30",
      "word": "thirty"
    },
    {
      "number": "40",
      "word": "forty"
    },
    {
      "number": "50",
      "word": "fifty"
    },
    {
      "number": "60",
      "word": "sixty"
    },
    {
      "number": "70",
      "word": "seventy"
    },
    {
      "number": "80",
      "word": "eighty"
    },
    {
      "number": "90",
      "word": "ninety"
    },
    {
      "number": "99",
      "word": "ninety-nine"
    },
    {
      "number": "100",
      "word": "one hundred"
    }
  ],
  "hundredToTwoThousand": [
    {
      "number": "100",
      "word": "one hundred"
    },
    {
      "number": "101",
      "word": "one hundred and one"
    },
    {
      "number": "110",
      "word": "one hundred and ten"
    },
    {
      "number": "125",
      "word": "one hundred and twenty-five"
    },
    {
      "number": "200",
      "word": "two hundred"
    },
    {
      "number": "250",
      "word": "two hundred and fifty"
    },
    {
      "number": "500",
      "word": "five hundred"
    },
    {
      "number": "999",
      "word": "nine hundred and ninety-nine"
    },
    {
      "number": "1,000",
      "word": "one thousand"
    },
    {
      "number": "1,250",
      "word": "one thousand two hundred and fifty"
    },
    {
      "number": "1,500",
      "word": "one thousand five hundred"
    },
    {
      "number": "2,000",
      "word": "two thousand"
    }
  ]
};
