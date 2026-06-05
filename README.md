# cdt-ai-module

## Converting PowerPoint decks to Marp

Install dependencies, then run the converter from the repository root:

```bash
python -m pip install -r requirements.txt
python scripts/pptx_to_marp.py
```

The script converts each `.pptx` deck into `slides/<deck-name>.md` and extracts images into `slides/images/<deck-name>/`.
