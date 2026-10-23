"""Local conversion only. No optional plugins, credentials, OCR or LLM clients."""
import json
import sys
from importlib.metadata import version
from markitdown import MarkItDown

result = MarkItDown(enable_plugins=False).convert_local(sys.argv[1])
print(json.dumps({"text": result.text_content, "version": version("markitdown")}, ensure_ascii=False))
