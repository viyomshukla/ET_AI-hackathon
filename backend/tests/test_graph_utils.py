# Unit tests for graph_utils.compute_rings(). No network/Supabase calls -
# just plain dicts in, plain dicts out, so this runs fast with `pytest`.

from graph_utils import compute_rings


def test_two_complaints_sharing_a_phone_form_a_ring():
    complaints = [
        {"id": 1, "city": "Delhi", "phone_number": "+919999999999", "bank_account": None},
        {"id": 2, "city": "Mumbai", "phone_number": "+919999999999", "bank_account": None},
    ]

    ring_by_id, rings = compute_rings(complaints)

    assert ring_by_id[1]["ring_id"] == ring_by_id[2]["ring_id"]
    assert ring_by_id[1]["ring_size"] == 2
    assert len(rings) == 1
    assert rings[0]["complaint_count"] == 2
    assert rings[0]["cities"] == ["Delhi", "Mumbai"]


def test_lone_complaint_is_not_a_ring():
    complaints = [
        {"id": 1, "city": "Delhi", "phone_number": "+919999999999", "bank_account": None},
    ]

    ring_by_id, rings = compute_rings(complaints)

    assert ring_by_id == {}
    assert rings == []


def test_shared_bank_account_also_forms_a_ring():
    complaints = [
        {"id": 1, "city": "Pune", "phone_number": None, "bank_account": "1234567890"},
        {"id": 2, "city": "Pune", "phone_number": None, "bank_account": "1234567890"},
        {"id": 3, "city": "Pune", "phone_number": None, "bank_account": "1234567890"},
    ]

    ring_by_id, rings = compute_rings(complaints)

    assert len(rings) == 1
    assert rings[0]["complaint_count"] == 3
    assert rings[0]["account_count"] == 1


def test_two_separate_rings_stay_separate_and_sort_by_size():
    complaints = [
        {"id": 1, "city": "Delhi", "phone_number": "A", "bank_account": None},
        {"id": 2, "city": "Delhi", "phone_number": "A", "bank_account": None},
        {"id": 3, "city": "Mumbai", "phone_number": "B", "bank_account": None},
        {"id": 4, "city": "Mumbai", "phone_number": "B", "bank_account": None},
        {"id": 5, "city": "Mumbai", "phone_number": "B", "bank_account": None},
    ]

    ring_by_id, rings = compute_rings(complaints)

    assert len(rings) == 2
    # Biggest ring (3 complaints) should be first.
    assert rings[0]["complaint_count"] == 3
    assert rings[1]["complaint_count"] == 2
    assert ring_by_id[1]["ring_id"] != ring_by_id[3]["ring_id"]


def test_a_shared_bank_account_can_bridge_two_phone_groups():
    # complaint 1 & 2 share a phone, complaint 2 & 3 share a bank account -
    # all three should end up in the same ring even though 1 and 3 share
    # nothing directly.
    complaints = [
        {"id": 1, "city": "Delhi", "phone_number": "A", "bank_account": None},
        {"id": 2, "city": "Delhi", "phone_number": "A", "bank_account": "X"},
        {"id": 3, "city": "Delhi", "phone_number": None, "bank_account": "X"},
    ]

    ring_by_id, rings = compute_rings(complaints)

    assert len(rings) == 1
    assert rings[0]["complaint_count"] == 3
