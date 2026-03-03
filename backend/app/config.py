import os


class Settings:
    USERNAME: str = os.getenv("OCTOCLOUD_USERNAME", "admin")
    PASSWORD: str = os.getenv("OCTOCLOUD_PASSWORD", "changeme")
    SECRET: str = os.getenv("OCTOCLOUD_SECRET", "change-me-in-production")
    STORAGE: str = os.getenv("OCTOCLOUD_STORAGE", "/data/files")
    DB: str = os.getenv("OCTOCLOUD_DB", "/data/octocloud.db")
    MAX_UPLOAD_MB: int = int(os.getenv("OCTOCLOUD_MAX_UPLOAD_MB", "500"))
    PORT: int = int(os.getenv("OCTOCLOUD_PORT", "5679"))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24


settings = Settings()
