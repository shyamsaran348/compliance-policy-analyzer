import multiprocessing
import multiprocessing.synchronize

def apply_patches():
    """
    Monkeypatch multiprocessing.SemLock to prevent [Errno 2] No such file or directory
    on Vercel/AWS Lambda where /dev/shm is missing.
    """
    try:
        # Define a dummy lock that implements the necessary interface
        class DummyLock:
            def __enter__(self): return self
            def __exit__(self, *args): pass
            def acquire(self, *args, **kwargs): return True
            def release(self, *args, **kwargs): pass
            def __repr__(self): return "<DummyLock>"

        # Patch directly on the synchronize module
        multiprocessing.synchronize.SemLock = DummyLock
        
        # Also try to patch the top-level alias if it exists
        if hasattr(multiprocessing, 'SemLock'):
            multiprocessing.SemLock = DummyLock
            
        print("✅ Applied multiprocessing.SemLock monkeypatch for Serverless environment.")
    except Exception as e:
        print(f"⚠️ Failed to patch SemLock: {e}")

apply_patches()
