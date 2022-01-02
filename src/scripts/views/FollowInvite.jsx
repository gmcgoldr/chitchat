export function FollowInvite() {
  return (
    <section>
      <div className="container">
        <h3>Follow Invite</h3>

        <p>You've been invited to follow Person.</p>

        <form>
          <button type="button" className="btn btn-primary">
            Follow
          </button>
          &nbsp;
          <button type="button" className="btn btn-danger">
            Decline
          </button>
        </form>
      </div>
    </section>
  );
}
