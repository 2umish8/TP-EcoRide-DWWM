# 📋 Comptes utilisateurs EcoRide

Ce document contient tous les identifiants des comptes de test créés pour l'application EcoRide.

## 🔐 Comptes créés via l'API (hashage sécurisé)

### 👤 Utilisateur Standard (TestUser)

-   **Pseudo :** `TestUser`
-   **Email :** `test@example.com`
-   **Mot de passe :** `TestUser2025`
-   **Rôles :** `passager` (par défaut), puis `chauffeur` (ajouté via API)
-   **Crédits :** 20

---

### 👨‍💼 Administrateur

-   **Pseudo :** `AdminEco`
-   **Email :** `admin@ecoride.com`
-   **Mot de passe :** `AdminEco2025`
-   **Rôles :** `administrateur` (ajouté manuellement en base)
-   **Crédits :** 9999

---

### 👷‍♂️ Employé

-   **Pseudo :** `EmployeJose`
-   **Email :** `jose@ecoride.com`
-   **Mot de passe :** `EmployeJose2025`
-   **Rôles :** `employe` (ajouté manuellement en base)
-   **Crédits :** 100

---

### 🚗 Chauffeur/Passager (Lila)

-   **Pseudo :** `LilaConduite`
-   **Email :** `lila@test.com`
-   **Mot de passe :** `LilaConduite2025`
-   **Rôles :** `chauffeur`, `passager` (chauffeur ajouté via API)
-   **Crédits :** 50

---

### 🧑‍🦲 Passager (Tom)

-   **Pseudo :** `TomPouce`
-   **Email :** `tom@test.com`
-   **Mot de passe :** `TomPouce2025`
-   **Rôles :** `passager`
-   **Crédits :** 20

---

## 📝 Process de création

1. **Tous les comptes** sont créés via `/api/users/register` (même les futurs admin/employés)
2. **Les rôles spéciaux** (admin, employé, chauffeur) sont ajoutés **manuellement en base** après inscription
3. **Format des mots de passe :** PseudoEnPascalCase + "2025"
4. **Crédits par défaut :** 20 pour tous, puis modifiés manuellement si besoin

## 🔄 Mise à jour

**Dernière mise à jour :** 21 juillet 2025
