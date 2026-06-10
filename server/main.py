from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

booked_dates = set()


class BookingRequest(BaseModel):
    startDate: str
    endDate: str


@app.post("/book")
async def book_dates(request: BookingRequest):

    start = datetime.strptime(
        request.startDate,
        "%Y-%m-%d"
    )

    end = datetime.strptime(
        request.endDate,
        "%Y-%m-%d"
    )

    if start > end:
        return {
            "success": False,
            "message": "Начальная дата позже конечной"
        }

    dates_to_book = []

    current = start

    while current <= end:
        date_string = current.strftime("%Y-%m-%d")

        if date_string in booked_dates:
            return {
                "success": False,
                "message": f"Дата {date_string} уже занята"
            }

        dates_to_book.append(date_string)

        current += timedelta(days=1)

    for date in dates_to_book:
        booked_dates.add(date)
    
    return {
        "success": True,
        "message": (
            f"Даты с {request.startDate} "
            f"по {request.endDate} "
            f"успешно забронированы"
        )
    }


@app.get("/dates")
async def get_dates():
    return {
        "bookedDates": sorted(list(booked_dates))
    }


@app.get("/")
async def root():
    return {
        "status": "Server is running"
    }
