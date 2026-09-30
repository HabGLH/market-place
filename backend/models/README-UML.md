# Backend Models UML

This folder contains `models.puml` — a PlantUML description of the backend Mongoose models and relationships.

Render instructions:

- Using the PlantUML jar (Java required):

```bash
# from the repo root
java -jar plantuml.jar backend/models/models.puml
# produces backend/models/models.png (or .svg depending on options)
```

- Using online PlantUML server: copy the contents of `models.puml` to https://www.planttext.com/ or https://plantuml.com/ and render.

- VS Code: install a PlantUML extension (e.g. `jebbs.plantuml`) and open `backend/models/models.puml` to preview and export.

Notes:

- The diagram models fields and high-level associations, not index or validation rules.
- `Cart.items` and `Order.products` are arrays referencing `Product`.
- `RefreshToken` documents are TTL-managed (uses `expiresAt`).
