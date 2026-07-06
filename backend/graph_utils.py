# Pure helper functions for Module 2 (Fraud Network Graph).
# Kept separate from main.py, with no Supabase/network calls, so they can be
# unit tested with plain Python dicts (see tests/test_graph_utils.py).

from collections import defaultdict


def compute_rings(complaints: list[dict]):
    """Group complaints into "fraud rings" - complaints connected to each
    other by sharing a phone number or bank account.

    A ring is one connected component of the complaint/phone/account graph
    that contains 2 or more complaints (a lone complaint with no shared
    phone/account isn't a "ring", just a single report).

    Returns:
        ring_by_complaint_id: {complaint_id: {"ring_id": str, "ring_size": int}}
            for complaints that belong to a ring (complaints not in any ring
            are simply absent from this dict).
        rings_summary: list of rings sorted by complaint_count (biggest
            first), each shaped like:
            {"ring_id", "complaint_count", "phone_count", "account_count", "cities"}
    """
    # Build an undirected graph: complaint nodes <-> phone/account nodes.
    # Using string-prefixed keys ("complaint-1", "phone-999...") keeps
    # complaint ids, phone numbers, and account numbers from colliding.
    adjacency = defaultdict(set)

    def link(a, b):
        adjacency[a].add(b)
        adjacency[b].add(a)

    for c in complaints:
        complaint_key = f"complaint-{c['id']}"
        if c.get("phone_number"):
            link(complaint_key, f"phone-{c['phone_number']}")
        if c.get("bank_account"):
            link(complaint_key, f"account-{c['bank_account']}")

    # Find connected components with a simple breadth-first search.
    visited = set()
    components = []

    for node in adjacency:
        if node in visited:
            continue
        component = set()
        queue = [node]
        while queue:
            current = queue.pop()
            if current in visited:
                continue
            visited.add(current)
            component.add(current)
            queue.extend(adjacency[current] - visited)
        components.append(component)

    # Look up city per complaint id, for the ring summary.
    city_by_complaint_id = {c["id"]: c.get("city") for c in complaints}

    ring_by_complaint_id = {}
    rings_summary = []
    ring_counter = 0

    for component in components:
        complaint_ids = [
            int(n.split("-", 1)[1]) for n in component if n.startswith("complaint-")
        ]
        # Only 2+ complaints sharing a node counts as a "ring".
        if len(complaint_ids) < 2:
            continue

        ring_counter += 1
        ring_id = f"ring-{ring_counter}"
        phone_count = sum(1 for n in component if n.startswith("phone-"))
        account_count = sum(1 for n in component if n.startswith("account-"))
        cities = sorted({city_by_complaint_id.get(cid) for cid in complaint_ids} - {None})

        for cid in complaint_ids:
            ring_by_complaint_id[cid] = {"ring_id": ring_id, "ring_size": len(complaint_ids)}

        rings_summary.append(
            {
                "ring_id": ring_id,
                "complaint_count": len(complaint_ids),
                "phone_count": phone_count,
                "account_count": account_count,
                "cities": cities,
            }
        )

    rings_summary.sort(key=lambda r: r["complaint_count"], reverse=True)
    return ring_by_complaint_id, rings_summary
