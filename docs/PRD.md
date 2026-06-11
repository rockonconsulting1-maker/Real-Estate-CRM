# PRD — RC CRM
## 9. Pipelines Resolution

### 9.5 Client Pipeline Model and Resolution Mechanism

The RC CRM follows a two-pipeline model for Clients: **Buyer Transaction** and **Seller Transaction**. This canonical model replaces the single 5-stage pipeline described in earlier drafts.

#### Resolution Mechanism
Pipelines are resolved dynamically to support different GoHighLevel sub-accounts:
1. **Automatic Discovery**: On authentication, the app fetches all pipelines from GHL. It matches them case-insensitively using includes() with the following default names:
   - 'Lead Nurture' for Leads
   - 'Buyer' for Buyer Clients
   - 'Seller' for Seller Clients
2. **Manual Mapping (Override)**: If automatic discovery fails or a user wants to use specific pipelines, they can manually map them in **Settings > Pipeline Mapping**. These mappings are stored in the `pipeline_mapping` column of the `app_users` table.
3. **Fallback UI**: If a pipeline cannot be resolved, a banner is displayed on the affected page (Leads or Clients) with a direct link to Settings for manual mapping.

#### Stages
Kanban stages are rendered dynamically based on the stages returned by the GHL API for the resolved pipeline, ensuring the UI always matches the actual GHL configuration.
