#!/bin/bash

# כתובת המאגר
repo_url="https://github.com/KALFANET/Jsx/blob/main"

# יצירת קובץ links.txt
output_file="links.txt"
echo "📌 רשימת קישורים לקבצים במאגר:" > "$output_file"

# שליפת כל הקבצים והוספתם לקובץ links.txt
git ls-files | while read file; do
  echo "$repo_url/$file" >> "$output_file"
done

echo "✅ קובץ links.txt נוצר בהצלחה עם כל הקישורים!"