# backend/app/core/rate_limiter.py

import time
from collections import defaultdict
from functools import wraps
from fastapi import HTTPException, status

RATE_LIMIT = 10          # requests
WINDOW_SECONDS = 60      # per minute

_request_log = defaultdict(list)


def rate_limiter(endpoint_func):
    @wraps(endpoint_func)
    def wrapper(*args, **kwargs):
        api_key = kwargs.get("api_key")

        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing API key"
            )

        now = time.time()
        window_start = now - WINDOW_SECONDS

        # Remove timestamps outside the window
        _request_log[api_key] = [
            t for t in _request_log[api_key] if t > window_start
        ]

        if len(_request_log[api_key]) >= RATE_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )

        _request_log[api_key].append(now)
        return endpoint_func(*args, **kwargs)

    return wrapper
