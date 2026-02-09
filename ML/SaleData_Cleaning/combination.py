from __future__ import annotations

import argparse
import csv
from collections.abc import Iterable
from pathlib import Path


def _sniff_dialect(path: Path, encoding: str) -> csv.Dialect:
    try:
        with path.open("r", newline="", encoding=encoding) as f:
            sample = f.read(4096)
        return csv.Sniffer().sniff(sample)
    except Exception:
        return csv.excel


def _iter_csv_files(directory: Path, pattern: str) -> list[Path]:
    return sorted([p for p in directory.glob(pattern) if p.is_file()])


def _merge_csvs(
    input_files: Iterable[Path],
    output_file: Path,
    *,
    encoding: str,
    add_source: bool,
) -> tuple[int, int]:
    files = list(input_files)
    if not files:
        raise SystemExit("No input CSV files found.")

    fieldnames: list[str] = []
    dialects: dict[Path, csv.Dialect] = {}

    for path in files:
        dialect = _sniff_dialect(path, encoding)
        dialects[path] = dialect
        with path.open("r", newline="", encoding=encoding) as f:
            reader = csv.DictReader(f, dialect=dialect)
            if not reader.fieldnames:
                continue
            for name in reader.fieldnames:
                if name not in fieldnames:
                    fieldnames.append(name)

    if add_source and "source_file" not in fieldnames:
        fieldnames.append("source_file")

    total_rows = 0
    with output_file.open("w", newline="", encoding=encoding) as out:
        writer = csv.DictWriter(out, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()

        for path in files:
            with path.open("r", newline="", encoding=encoding) as f:
                reader = csv.DictReader(f, dialect=dialects[path])
                if not reader.fieldnames:
                    continue
                for row in reader:
                    if add_source:
                        row = dict(row)
                        row["source_file"] = path.name
                    writer.writerow({k: row.get(k, "") for k in fieldnames})
                    total_rows += 1

    return (len(files), total_rows)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Merge all CSV files in the same directory into one CSV."
    )
    parser.add_argument(
        "--dir",
        type=Path,
        default=Path(__file__).resolve().parent,
        help="Directory containing CSV files (default: script directory).",
    )
    parser.add_argument(
        "--pattern",
        default="*.csv",
        help="Glob pattern for input files (default: *.csv).",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("food_sales.csv"),
        help="Output CSV filename (default: food_sales.csv).",
    )
    parser.add_argument(
        "--encoding",
        default="utf-8-sig",
        help="File encoding for read/write (default: utf-8-sig).",
    )
    parser.add_argument(
        "--add-source",
        action="store_true",
        help="Add a source_file column to each row.",
    )
    args = parser.parse_args()

    directory = args.dir.resolve()
    output_file = (
        (directory / args.output).resolve() if not args.output.is_absolute() else args.output
    )

    input_files = _iter_csv_files(directory, args.pattern)
    input_files = [p for p in input_files if p.resolve() != output_file.resolve()]

    file_count, row_count = _merge_csvs(
        input_files, output_file, encoding=args.encoding, add_source=args.add_source
    )
    print(f"Merged {file_count} files, {row_count} rows -> {output_file}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
